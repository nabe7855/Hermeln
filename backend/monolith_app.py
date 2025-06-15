import os
import time
from flask import Flask, jsonify, request, url_for, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from openai import OpenAI

# --- アプリの作成と設定 ---
app = Flask(__name__)
CORS(app)

# --- 設定を直接書き込む ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SECRET_KEY'] = 'a-very-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['OPENAI_API_KEY'] = os.environ.get('OPENAI_API_KEY')

# --- データベースの初期化 ---
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# --- モデルの定義 ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    native_language = db.Column(db.String(64))
    learning_language = db.Column(db.String(64))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
class AudioPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text_content = db.Column(db.Text, nullable=False)
    audio_filename = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    author = db.relationship('User', backref=db.backref('posts', lazy=True))

    def __repr__(self):
            return f'<AudioPost {self.id}>'

# --- APIの定義 ---
@app.route('/api/users/register', methods=['POST'])
def register_user():
    data = request.get_json() or {}
    # ... (登録処理は、以前のusers.pyからコピペ)
    if 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing data'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already in use'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email address already in use'}), 400
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully', 'user_id': user.id}), 201


@app.route('/api/users/<int:id>', methods=['GET'])
def get_user(id):
    user = User.query.get_or_404(id)
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'native_language': user.native_language,
        'learning_language': user.learning_language
    })

@app.route('/api/users/<int:id>/language', methods=['PUT'])
def update_language(id):
    user = User.query.get_or_404(id)
    # ... (言語設定の更新処理を、以前のusers.pyからコピペ)
    data = request.get_json() or {}
    if 'native_language' not in data or 'learning_language' not in data:
        return jsonify({'error': 'Missing data'}), 400
    user.native_language = data['native_language']
    user.learning_language = data['learning_language']
    db.session.commit()
    return jsonify({'message': 'Language settings updated successfully'})


@app.route('/api/users/<int:id>/generate-intro', methods=['POST'])
def generate_intro(id):
    client = OpenAI(api_key=app.config['OPENAI_API_KEY'])
    
    user = User.query.get_or_404(id)
    # ... (AI自己紹介文の生成処理を、以前のusers.pyからコピペ)
    data = request.get_json() or {}
    hobbies = data.get('hobbies', '特にありません')
    prompt = f"ユーザー名: {user.username}, 趣味: {hobbies}の人のための、親しみやすい自己紹介文を、30語程度の英語で作成してください。"
    try:
        response = client.chat.completions.create(model="gpt-3.5-turbo", messages=[{"role": "user", "content": prompt}])
        intro_text = response.choices[0].message.content
        return jsonify({'intro_text': intro_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(os.path.join(basedir, 'uploads'), filename)

# import に send_from_directory を追加


@app.route('/api/posts/create', methods=['POST'])
def create_post():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file part'}), 400
    
    file = request.files['audio']
    text_content = request.form.get('text_content')
    user_id = request.form.get('user_id')

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and user_id and text_content:
        timestamp = int(time.time() * 1000)
        filename = secure_filename(f"{user_id}_{timestamp}_{file.filename}") # ファイル名が重複しないように、少し改良
        
        upload_folder = os.path.join(basedir, 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file.save(os.path.join(upload_folder, filename))

        new_post = AudioPost(
            text_content=text_content,
            audio_filename=filename,
            user_id=user_id
        )
        db.session.add(new_post)
        db.session.commit()

        return jsonify({'message': 'Post created successfully'}), 201

    return jsonify({'error': 'Missing data'}), 400

@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts = AudioPost.query.order_by(AudioPost.id.desc()).all()
    posts_data = []
    for post in posts:
        posts_data.append({
            'id': post.id,
            'text_content': post.text_content,
            'audio_url': url_for('uploaded_file', filename=post.audio_filename, _external=True),
            'author_username': post.author.username # "author" から "author_username" に修正
        })
    return jsonify(posts_data)

# --- 起動スイッチ ---
if __name__ == '__main__':
    app.run(debug=True)