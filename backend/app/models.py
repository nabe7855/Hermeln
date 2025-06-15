#from . import db # 後で作成するdbオブジェクトをインポート
from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    native_language = db.Column(db.String(64))
    learning_language = db.Column(db.String(64))



# ... Userクラスの中 ...
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    # __repr__ も User クラスの一部なので、インデントを揃える
    def __repr__(self):
        return '<User {}>'.format(self.username)