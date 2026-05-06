import 'package:flutter/material.dart';
import 'package:mobile_prestataire/services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _profile;
  List<dynamic> _reviews = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final profile = await ApiService.get('/profile');
      final reviews = await ApiService.get('/provider/reviews');
      setState(() {
        _profile = profile;
        _reviews = reviews['data'] ?? [];
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _editProfile() async {
    final nomCtrl = TextEditingController(text: _profile?['nomCommercial'] ?? '');
    final phoneCtrl = TextEditingController(text: _profile?['phone'] ?? '');
    await showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Modifier profil'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: nomCtrl, decoration: const InputDecoration(labelText: 'Nom commercial')),
          TextField(controller: phoneCtrl, decoration: const InputDecoration(labelText: 'Telephone')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Annuler')),
          FilledButton(
            onPressed: () async {
              await ApiService.put('/profile', {
                'nom_commercial': nomCtrl.text,
                'phone': phoneCtrl.text,
              });
              if (mounted) Navigator.pop(context);
              _loadProfile();
            },
            child: const Text('Enregistrer'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9FF),
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(colors: [Color(0xFF4F3D8A), Color(0xFF7C5CBF)]),
          ),
        ),
        title: const Text('Mon Profil', style: TextStyle(color: Colors.white)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _profile == null
              ? const Center(child: Text('Erreur chargement profil'))
              : RefreshIndicator(
                  onRefresh: _loadProfile,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(24),
                    child: Column(children: [
                      CircleAvatar(
                        radius: 50,
                        backgroundColor: const Color(0xFF4F3D8A),
                        child: Text(
                          (_profile!['nomCommercial'] ?? 'P')[0].toUpperCase(),
                          style: const TextStyle(fontSize: 36, color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _profile!['nomCommercial'] ?? 'Prestataire',
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF4F3D8A)),
                      ),
                      Text(_profile!['email'] ?? '', style: const TextStyle(color: Colors.grey)),
                      const SizedBox(height: 24),
                      _infoCard('Telephone', _profile!['phone'] ?? 'Non defini'),
                      _infoCard('Role', _profile!['role'] ?? ''),
                      _infoCard('Compte actif', _profile!['isActive'] == true ? 'Oui' : 'Non'),
                      _infoCard('Disponible', _profile!['isAvailableNow'] == true ? 'Oui' : 'Non'),
                      _infoCard('Gouvernorats', (_profile!['governorates'] as List?)?.join(', ') ?? 'Non defini'),
                      _infoCard('Categories', (_profile!['categories'] as List?)?.join(', ') ?? 'Non defini'),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F3D8A)),
                          icon: const Icon(Icons.edit, color: Colors.white),
                          label: const Text('Modifier profil', style: TextStyle(color: Colors.white)),
                          onPressed: _editProfile,
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Align(
                        alignment: Alignment.centerLeft,
                        child: Text('Avis clients', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(height: 8),
                      if (_reviews.isEmpty)
                        _infoCard('Avis', 'Aucun avis')
                      else
                        ..._reviews.map((r) => _infoCard('${r['rating']} / 5', r['comment'] ?? 'Sans commentaire')),
                    ]),
                  ),
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
        boxShadow: [BoxShadow(blurRadius: 6, color: Colors.black.withValues(alpha: 0.06))],
      ),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Flexible(child: Text(label, style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.w500))),
        const SizedBox(width: 12),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E1B3A)),
          ),
        ),
      ]),
    );
  }
}
