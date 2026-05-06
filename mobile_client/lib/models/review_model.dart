class ReviewModel {
  final int? id;
  final int rating;
  final String? comment;
  final int? appointmentId;

  ReviewModel({
    this.id,
    required this.rating,
    this.comment,
    this.appointmentId,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id'],
      rating: json['rating'] ?? 0,
      comment: json['comment'],
      appointmentId: json['appointment_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'rating': rating,
      'comment': comment,
      'appointment_id': appointmentId,
    };
  }
}