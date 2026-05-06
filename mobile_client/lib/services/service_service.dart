import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import '../models/service_model.dart';

class ServiceService {
  final Dio _dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<List<ServiceModel>> getServices() async {
    try {
      final token = await _storage.read(key: 'jwt_token');
      final response = await _dio.get(
        '/services',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      final List data = response.data;
      return data.map((e) => ServiceModel.fromJson(e)).toList();
    } catch (e) {
      return [];
    }
  }
}