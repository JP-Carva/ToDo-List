class User {
  constructor(id, username, email, password_hash, created_at) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password_hash = password_hash;
    this.created_at = created_at;
  }
}

export default User;
