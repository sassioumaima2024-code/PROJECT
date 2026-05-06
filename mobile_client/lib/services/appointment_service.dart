import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/appointment_model.dart';

class AppointmentService {
  final Dio _dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));

  Future<bool> createAppointment(AppointmentModel appointment) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      print('TOKEN: $token');

      if (token == null) {
        print('TOKEN EST NULL !');
        return false;
      }

      await _dio.post(
        '/appointments',
        data: appointment.toJson(),
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return true;
    } catch (e) {
      print('ERREUR: $e');
      return false;
    }
  }

  Future<List<AppointmentModel>> getMyAppointments() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      final response = await _dio.get(
        '/appointments/my',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      final List data = response.data;
      return data.map((e) => AppointmentModel.fromJson(e)).toList();
    } catch (e) {
      return [];
    }
  }
}