import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, FileText, CheckCircle2, User, Building, Wrench } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function JobSheet() {
  const [loading, setLoading] = useState(false);
  const [installations, setInstallations] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Form State
  const [selectedInstallation, setSelectedInstallation] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [jobDate, setJobDate] = useState(new Date().toISOString().split('T')[0]);
  const [jobType, setJobType] = useState('Профилактика');
  const [workDescription, setWorkDescription] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [status, setStatus] = useState('Завършена');

  // Parts used in job sheet
  const [parts, setParts] = useState([
    { name: '', quantity: 1, unitPrice: 0 }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [instRes, techRes, custRes] = await Promise.all([
        supabase.from('installations').select('*'),
        supabase.from('technicians').select('*'),
        supabase.from('customers').select('*')
      ]);

      if (instRes.data) setInstallations(instRes.data);
      if (techRes.data) setTechnicians(techRes.data);
      if (custRes.data) setCustomers(custRes.data);
    } catch (error) {
      console.error('Грешка при зареждане на данните:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallationChange = (instId) => {
    setSelectedInstallation(instId);
    const inst = installations.find((i) => i.id === instId);
    if (inst && inst.customer_id) {
      setSelectedCustomer(inst.customer_id);
    }
  };

  const handleAddPart = () => {
    setParts([...parts, { name: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemovePart = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handlePartChange = (index, field, value) => {
    const updated = [...parts];
    updated[index][field] = value;
    setParts(updated);
  };

  const calculateTotal = () => {
    return parts.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInstallation || !selectedTechnician) {
      alert('Моля изберете асансьор/инсталация и техник.');
      return;
    }

    setLoading(true);
    try {
      const serviceLogPayload = {
        installation_id: selectedInstallation,
        technician_id: selectedTechnician,
        type: jobType,
        description: workDescription,
        parts_used: JSON.stringify(parts),
        date: jobDate,
        notes: recommendations
      };

      const { error } = await supabase.from('service_logs').insert([serviceLogPayload]);
      if (error) throw error;

      alert('Работната карта беше запазена успешно!');
      // Reset form
      setWorkDescription('');
      setRecommendations('');
      setParts([{ name: '', quantity: 1, unitPrice: 0 }]);
    } catch (err) {
      console.error('Грешка при запазване:', err);
      alert('Грешка при запазване на работната карта.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Работна Карта / Протокол"
        subtitle="Създаване и управление на сервизни карти за извършени ремонти и поддръжка"
        icon={<FileText className="w-8 h-8 text-blue-600" />}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Данни за съоръжението и техника */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-slate-500" />
              Обща информация
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Съоръжение / Асансьор</label>
              <Select value={selectedInstallation} onValueChange={handleInstallationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Изберете съоръжение..." />
                </SelectTrigger>
                <SelectContent>
                  {installations.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.factory_no} - {inst.address || inst.location || 'Без адрес'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Клиент / Обект</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Изберете клиент..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Отговорен Техник</label>
              <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                <SelectTrigger>
                  <SelectValue placeholder="Изберете техник..." />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name} ({tech.role || 'Техник'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Дата на извършване</label>
              <Input type="date" value={jobDate} onChange={(e) => setJobDate(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Вид дейност</label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Профилактика">Месечна Профилактика</SelectItem>
                  <SelectItem value="Авария">Авариен Ремонт</SelectItem>
                  <SelectItem value="Планов Ремонт">Планов Ремонт</SelectItem>
                  <SelectItem value="Инспекция">Годишна Инспекция</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Статус на картата</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="В процес">В процес</SelectItem>
                  <SelectItem value="Завършена">Завършена</SelectItem>
                  <SelectItem value="За одобрение">За одобрение от Мениджър</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Описание на дейността */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Описание на извършените работи</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Подробно описание</label>
              <Textarea
                rows={4}
                placeholder="Опишете извършените дейности, установените повреди и предприетите мерки..."
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Препоръки / Забележки</label>
              <Textarea
                rows={2}
                placeholder="Препоръки за последващи ремонти или подмяна на части..."
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Използвани резервни части */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Вложени материали и резервни части</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddPart}>
              <Plus className="w-4 h-4 mr-1" /> Добави част
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Наименование / Артикул</TableHead>
                  <TableHead className="w-32">Количество</TableHead>
                  <TableHead className="w-36">Ед. Цена (лв)</TableHead>
                  <TableHead className="w-36">Общо (лв)</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Input
                        placeholder="Име на част / компонент"
                        value={part.name}
                        onChange={(e) => handlePartChange(idx, 'name', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={part.quantity}
                        onChange={(e) => handlePartChange(idx, 'quantity', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={part.unitPrice}
                        onChange={(e) => handlePartChange(idx, 'unitPrice', e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700">
                      {((parseFloat(part.quantity) || 0) * (parseFloat(part.unitPrice) || 0)).toFixed(2)} лв
                    </TableCell>
                    <TableCell>
                      {parts.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePart(idx)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-4 text-lg font-bold text-slate-800">
              Крайна сума: {calculateTotal().toFixed(2)} лв
            </div>
          </CardContent>
        </Card>

        {/* Действия */}
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Запазване...' : 'Запази работната карта'}
          </Button>
        </div>
      </form>
    </div>
  );
}
