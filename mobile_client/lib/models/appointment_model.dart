class AppointmentModel {
  final int? id;
  final String address;
  final String description;
  final bool isUrgent;
  final DateTime? date;
  final int? providerId;
  final int? serviceId;
  final String? status;

  AppointmentModel({
    this.id,
    required this.address,
    required this.description,
    this.isUrgent = false,
    this.date,
    this.providerId,
    this.serviceId,
    this.status,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      id: json['id'],
      address: json['address'] ?? '',
      description: json['description'] ?? '',
      isUrgent: json['isUrgent'] ?? false,
      status: json['status'],
      date: json['scheduled_at'] != null
          ? DateTime.parse(json['scheduled_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'description': description,
      'scheduled_at': date?.toIso8601String(),
      'provider_id': providerId ?? 1,
      'service_id': serviceId ?? 1,
    };
  }
}