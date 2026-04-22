import 'package:flutter/material.dart';
import 'package:mobile_prestataire/services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _profile;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final res = await ApiService.get('/profile');
      setState(() { _profile = res; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9FF),
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
                colors: [Color(0xFF4F3D8A), Color(0xFF7C5CBF)]))),
        title: const Text('Mon Profil', style: TextStyle(color: Colors.white)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _profile == null
              ? const Center(child: Text('Erreur chargement profil'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(children: [
                    // Avatar
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: const Color(0xFF4F3D8A),
                      child: Text(
                        (_profile!['nomCommercial'] ?? 'P')[0].toUpperCase(),
                        style: const TextStyle(
                            fontSize: 36, color: Colors.white,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _profile!['nomCommercial'] ?? 'Prestataire',
                      style: const TextStyle(
                          fontSize: 22, fontWeight: FontWeight.bold,
                          color: Color(0xFF4F3D8A)),
                    ),
                    Text(_profile!['email'] ?? '',
                        style: const TextStyle(color: Colors.grey)),
                    const SizedBox(height: 24),
                    // Infos
                    _infoCard('📞 Téléphone', _profile!['phone'] ?? 'Non défini'),
                    _infoCard('🎯 Rôle', _profile!['role'] ?? ''),
                    _infoCard('✅ Compte actif',
                        _profile!['isActive'] == true ? 'Oui' : 'Non'),
                    _infoCard('📍 Gouvernorats',
                        (_profile!['governorates'] as List?)?.join(', ') ?? 'Non défini'),
                    _infoCard('🔧 Catégories',
                        (_profile!['categories'] as List?)?.join(', ') ?? 'Non défini'),
                  ]),
                ),
    );
  }

  Widget _infoCard(String label, String value) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(
            blurRadius: 6, color: Colors.black.withOpacity(0.06))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(
              color: Colors.grey, fontWeight: FontWeight.w500)),
          Text(value, style: const TextStyle(
              fontWeight: FontWeight.bold, color: Color(0xFF1E1B3A))),
        ],
      ),
    );
  }
}