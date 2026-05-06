class UserModel {
  final int id;
  final String email;
  final String role;
  final String? nom;

  UserModel({
    required this.id,
    required this.email,
    required this.role,
    this.nom,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      email: json['email'],
      role: json['role'],
      nom: json['nom'],
    );
  }
}