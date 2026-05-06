import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/notification_model.dart';

class NotificationService {
  final Dio _dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));

  Future<List<NotificationModel>> getMyNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      final response = await _dio.get(
        '/notifications',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      final List data = response.data;
      return data.map((e) => NotificationModel.fromJson(e)).toList();
    } catch (e) {
      print('ERREUR NOTIFICATIONS: $e');
      return [];
    }
  }

  Future<bool> markAsRead(int id) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      await _dio.patch(
        '/notifications/$id/read',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return true;
    } catch (e) {
      return false;
    }
  }
}