import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/category_model.dart';

class CategoryService {
  final Dio _dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));

  Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await _dio.get('/categories');
      final List data = response.data;
      return data.map((e) => CategoryModel.fromJson(e)).toList();
    } catch (e) {
      print('ERREUR CATEGORIES: $e');
      return [];
    }
  }
}