import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:8000/api';
  static final _storage = FlutterSecureStorage();
  static final _dio = Dio(BaseOptions(baseUrl: baseUrl));

  static Future<void> init() async {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'jwt_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
  }

  static Future<Map<String, dynamic>> post(String path, Map data) async {
    final response = await _dio.post(path, data: data);
    return response.data;
  }

  static Future<Map<String, dynamic>> get(String path,
      {Map<String, dynamic>? params}) async {
    final response = await _dio.get(path, queryParameters: params);
    return response.data;
  }

  static Future<Map<String, dynamic>> patch(String path, [Map? data]) async {
    final response = await _dio.patch(path, data: data);
    return response.data;
  }

  static Future<void> saveToken(String token) async {
    await _storage.write(key: 'jwt_token', value: token);
  }

  static Future<void> deleteToken() async {
    await _storage.delete(key: 'jwt_token');
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }
}