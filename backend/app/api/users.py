from openai import OpenAI
from flask import request, jsonify
from app.api import bp
from app.models import User
from app import db
from flask import current_app


@bp.route('/users/register', methods=['POST'])
def register_user():
    data = request.get_json() or {}
    if 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing data'}), 400
    
    # すでに同じユーザー名やメールアドレスが使われていないかチェック
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already in use'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email address already in use'}), 400

    # 新しいユーザーのインスタンスを作成
    user = User(
        username=data['username'],
        email=data['email'],
        # TODO: native_language, learning_language も後で追加する
    )
    # パスワードをハッシュ化して設定
    user.set_password(data['password'])

    # データベースにユーザーを追加して、保存を確定する
    db.session.add(user)
    db.session.commit()

    return jsonify({
    'message': 'User registered successfully',
    'user_id': user.id  # 作成されたユーザーのIDを追加で返す
}), 201
    
@bp.route('/users/<int:id>', methods=['GET'])
def get_user(id):
    user = User.query.get_or_404(id)
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        # ... 他に必要な情報があれば、ここに追加
    })


@bp.route('/users/<int:id>/language', methods=['PUT'])
def update_language(id):
    user = User.query.get_or_404(id)
    data = request.get_json() or {}

    if 'native_language' not in data or 'learning_language' not in data:
        return jsonify({'error': 'Missing data'}), 400

    user.native_language = data['native_language']
    user.learning_language = data['learning_language']
    
    db.session.commit()

    return jsonify({'message': 'Language settings updated successfully'})

@bp.route('/users/<int:id>/generate-intro', methods=['POST'])
def generate_intro(id):
    client = OpenAI(api_key=current_app.config['OPENAI_API_KEY'])
    
    user = User.query.get_or_404(id)
    data = request.get_json() or {}
    
    # フロントエンドから趣味などの情報を受け取る
    hobbies = data.get('hobbies', '特にありません') # もし趣味がなければデフォルト値

    # OpenAIに渡すプロンプト（命令文）を作成
    prompt = f"""
    あなたは、フレンドリーな言語学習アシスタントです。
    以下の情報を持つユーザーの、自己紹介文を生成してください。

    - 名前: {user.username}
    - 母語: {user.native_language}
    - 学習中の言語: {user.learning_language}
    - 趣味: {hobbies}

    自己紹介文は、学習中の言語で、30語程度の親しみやすい文章にしてください。
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "あなたは親切で、クリエイティブなアシスタントです。"},
                {"role": "user", "content": prompt}
            ]
        )
        
        intro_text = response.choices[0].message.content
        
        return jsonify({'intro_text': intro_text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500