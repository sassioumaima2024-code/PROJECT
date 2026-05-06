import 'package:flutter/material.dart';
import 'package:mobile_prestataire/services/api_service.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});
  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  List<dynamic> _services = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  Future<void> _loadServices() async {
    try {
      final res = await ApiService.get('/provider/services');
      setState(() { _services = res['data'] ?? []; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _toggleService(int id, bool current) async {
    await ApiService.patch('/provider/services/$id/toggle');
    _loadServices();
  }

  void _showAddService() {
    final titleCtrl    = TextEditingController();
    final priceMinCtrl = TextEditingController();
    final priceMaxCtrl = TextEditingController();
    final descriptionCtrl = TextEditingController();
    int experience = 0;
    String selectedCategory = 'Plomberie';
    final selectedGovernorates = <String>{'Tunis'};

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 24, right: 24, top: 24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text('Ajouter un Service',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold,
                  color: Color(0xFF4F3D8A))),
          const SizedBox(height: 16),
          TextField(
            controller: titleCtrl,
            decoration: InputDecoration(
              labelText: 'Titre du service',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: selectedCategory,
            decoration: InputDecoration(
              labelText: 'Catégorie',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
            items: ['Plomberie','Électricité','Ménage','Coiffure','Peinture','Taxi']
                .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                .toList(),
            onChanged: (v) => selectedCategory = v!,
          ),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: TextField(
              controller: priceMinCtrl,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Prix min (DT)',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            )),
            const SizedBox(width: 12),
            Expanded(child: TextField(
              controller: priceMaxCtrl,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Prix max (DT)',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            )),
          ]),
          const SizedBox(height: 12),
          TextField(
            controller: descriptionCtrl,
            maxLines: 2,
            decoration: InputDecoration(
              labelText: 'Description',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 12),
          StatefulBuilder(
            builder: (context, setSheetState) => Column(children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('Annees experience'),
                Row(children: [
                  IconButton(
                    icon: const Icon(Icons.remove_circle_outline),
                    onPressed: experience > 0 ? () => setSheetState(() => experience--) : null,
                  ),
                  Text('$experience'),
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline),
                    onPressed: () => setSheetState(() => experience++),
                  ),
                ]),
              ]),
              Align(
                alignment: Alignment.centerLeft,
                child: Wrap(
                  spacing: 8,
                  children: ['Tunis', 'Ariana', 'Ben Arous', 'Sousse', 'Sfax'].map((g) {
                    final selected = selectedGovernorates.contains(g);
                    return FilterChip(
                      label: Text(g),
                      selected: selected,
                      onSelected: (value) => setSheetState(() {
                        value ? selectedGovernorates.add(g) : selectedGovernorates.remove(g);
                      }),
                    );
                  }).toList(),
                ),
              ),
            ]),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4F3D8A),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () async {
                final navigator = Navigator.of(context);
                await ApiService.post('/provider/services', {
                  'title':     titleCtrl.text,
                  'category':  selectedCategory,
                  'price_min': double.tryParse(priceMinCtrl.text) ?? 0,
                  'price_max': double.tryParse(priceMaxCtrl.text) ?? 0,
                  'description': descriptionCtrl.text,
                  'experience': experience,
                  'governorates': selectedGovernorates.toList(),
                });
                if (!mounted) return;
                navigator.pop();
                _loadServices();
              },
              child: const Text('Ajouter', style: TextStyle(color: Colors.white)),
            ),
          ),
          const SizedBox(height: 16),
        ]),
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
            gradient: LinearGradient(
                colors: [Color(0xFF4F3D8A), Color(0xFF7C5CBF)]))),
        title: const Text('Mes Services', style: TextStyle(color: Colors.white)),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF4F3D8A),
        onPressed: _showAddService,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _services.isEmpty
              ? const Center(child: Text('Aucun service. Appuyez sur + pour ajouter.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _services.length,
                  itemBuilder: (_, i) {
                    final s = _services[i];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [BoxShadow(
                            blurRadius: 8,
                            color: Colors.black.withValues(alpha: 0.08))],
                      ),
                      child: Row(children: [
                        Expanded(child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(s['title'] ?? '',
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold, fontSize: 16)),
                            Text(s['category'] ?? '',
                                style: const TextStyle(color: Colors.grey)),
                            Text('${s['priceMin']} – ${s['priceMax']} DT',
                                style: const TextStyle(color: Color(0xFFD4A017))),
                          ],
                        )),
                        Switch(
                          value: s['isActive'] ?? true,
                          activeThumbColor: const Color(0xFF059669),
                          onChanged: (v) => _toggleService(s['id'], v),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () async {
                            await ApiService.delete('/provider/services/${s['id']}');
                            _loadServices();
                          },
                        ),
                      ]),
                    );
                  },
                ),
    );
  }
}
