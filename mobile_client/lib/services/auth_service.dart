import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user_model.dart';

class AuthService {
  final Dio _dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));

  Future<bool> register({
    required String email,
    required String password,
    required String phone,
  }) async {
    try {
      final response = await _dio.post('/register', data: {
        'email': email,
        'password': password,
        'phone': phone,
        'role': 'client',
      });
      return response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

Future<UserModel?> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post('/login', data: {
        'email': email,
        'password': password,
      });

      final token = response.data['token'];
      final prefs = await SharedPreferences.getInstance();
      
      // Sauvegarde le token
      await prefs.setString('jwt_token', token);
      
      // Sauvegarde les infos utilisateur
      await prefs.setString('user_email', response.data['user']['email'] ?? '');
      await prefs.setString('user_role', response.data['user']['role'] ?? '');

      return UserModel.fromJson(response.data['user']);
    } catch (e) {
      print('ERREUR LOGIN: $e');
      return null;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token') != null;
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }
}