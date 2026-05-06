class ServiceModel {
  final int id;
  final String title;
  final String description;
  final String category;
  final double price;
  final String? photo;

  ServiceModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.price,
    this.photo,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      photo: json['photo'],
    );
  }
}