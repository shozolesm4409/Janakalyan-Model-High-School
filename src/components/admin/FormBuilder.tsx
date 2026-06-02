import React from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { CustomForm, CustomFormField } from '../../types';
import { 
  AppWindow, 
  PlusCircle, 
  Trash2, 
  Save, 
  Settings, 
  FileText, 
  List, 
  Plus,
  ArrowRight,
  Shield,
  Eye,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FormBuilder: React.FC = () => {
  const [forms, setForms] = React.useState<CustomForm[]>([]);
  const [fields, setFields] = React.useState<CustomFormField[]>([]);
  const [activeFormId, setActiveFormId] = React.useState<string | null>(null);
  
  // New Form states
  const [isCreating, setIsCreating] = React.useState(false);
  const [newFormTitle, setNewFormTitle] = React.useState('');
  const [newFormSlug, setNewFormSlug] = React.useState('');
  const [newFormDesc, setNewFormDesc] = React.useState('');

  React.useEffect(() => {
    const unsubForms = onSnapshot(collection(db, 'forms'), (snap) => {
      const items: CustomForm[] = [];
      snap.forEach(d => items.push(d.data() as CustomForm));
      setForms(items);
    });
    
    const unsubFields = onSnapshot(collection(db, 'form_fields'), (snap) => {
      const items: CustomFormField[] = [];
      snap.forEach(d => items.push(d.data() as CustomFormField));
      setFields(items);
    });

    return () => {
      unsubForms();
      unsubFields();
    };
  }, []);

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle.trim() || !newFormSlug.trim()) return;
    
    const formId = `form_${Date.now()}`;
    const newForm: CustomForm = {
      formId,
      title: newFormTitle.trim(),
      slug: newFormSlug.trim(),
      description: newFormDesc.trim(),
      status: 'active',
      permission: 'login_required',
      createdBy: 'admin',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'forms', formId), newForm);
      setNewFormTitle('');
      setNewFormSlug('');
      setNewFormDesc('');
      setIsCreating(false);
      setActiveFormId(formId);
    } catch (err) {
      console.error(err);
      alert('ফরম তৈরি করতে সমস্যা হয়েছে।');
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ফরমটি ডিলিট করতে চান? ')) return;
    try {
      await deleteDoc(doc(db, 'forms', id));
      if (activeFormId === id) setActiveFormId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddField = async (formId: string) => {
    const fieldId = `field_${Date.now()}`;
    const newField: CustomFormField = {
      fieldId,
      formId,
      label: 'নতুন ফিল্ড',
      fieldType: 'text',
      required: false,
      placeholder: '',
      options: [],
      sortOrder: fields.filter(f => f.formId === formId).length + 1
    };

    try {
      await setDoc(doc(db, 'form_fields', fieldId), newField);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateField = async (field: CustomFormField, updates: Partial<CustomFormField>) => {
    try {
      await setDoc(doc(db, 'form_fields', field.fieldId), { ...field, ...updates });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteField = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'form_fields', id));
    } catch (err) {
      console.error(err);
    }
  };

  const activeForm = forms.find(f => f.formId === activeFormId);
  const activeFields = fields.filter(f => f.formId === activeFormId).sort((a,b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
             <AppWindow className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">ডায়নামিক কাস্টম ফর্ম বিল্ডার</h2>
            <p className="text-xs text-gray-400 font-medium tracking-tight">আপনার প্রয়োজন অনুযায়ী যেকোনো সময় নতুন ডাটা কালেকশন ফর্ম তৈরি করুন</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 shadow-lg shadow-primary/20 transition transform active:scale-95 cursor-pointer"
        >
          <PlusCircle className="h-5 w-5" />
          <span>নতুন ফরম তৈরি করুন (Create Form)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Form Directory and Base Settings */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* 1. Form Directory / List Card */}
          <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 p-4">
               <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-widest flex items-center gap-2 font-sans">
                 <List className="h-4 w-4 text-primary" />
                 <span>কাস্টম ফরম ডিরেক্টরি (Forms Queue)</span>
               </h3>
            </div>
            <div className="p-2 space-y-1.5 max-h-[350px] overflow-y-auto">
              {forms.map((f) => (
                <div 
                  key={f.formId}
                  onClick={() => setActiveFormId(f.formId)}
                  className={`group p-3.5 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                    activeFormId === f.formId 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-transparent bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-gray-900 text-xs">{f.title}</h4>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono">/{f.slug}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${f.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`} />
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteForm(f.formId); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {forms.length === 0 && (
                <div className="py-20 text-center font-sans">
                  <p className="text-[11px] text-gray-400 font-medium">কোন কাস্টম ফরম ডিরেক্টরিতে নেই</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Form Settings Editor Card */}
          <AnimatePresence mode="wait">
            {activeFormId && activeForm && (
              <motion.div 
                key={activeFormId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden"
              >
                <div className="bg-gray-50 border-b border-gray-100 p-4">
                  <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-widest flex items-center gap-2 font-sans">
                    <Settings className="h-4 w-4 text-primary" />
                    <span>ফরম সেটিংস এডিট করুন (Settings)</span>
                  </h3>
                </div>
                <div className="p-5 space-y-5 font-sans">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">বড় শিরোনাম (Form Title)</label>
                    <input 
                      type="text" 
                      value={activeForm.title}
                      onChange={e => setDoc(doc(db, 'forms', activeForm.formId), { ...activeForm, title: e.target.value })}
                      className="w-full border border-gray-150 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-1 focus:ring-primary outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">ইউআরএল স্ল্যাগ (Slug)</label>
                    <input 
                      type="text" 
                      value={activeForm.slug}
                      onChange={e => setDoc(doc(db, 'forms', activeForm.formId), { ...activeForm, slug: e.target.value })}
                      className="w-full border border-gray-150 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-1 focus:ring-primary outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">অ্যাক্সেস পারমিশন</label>
                    <select 
                      value={activeForm.permission}
                      onChange={e => setDoc(doc(db, 'forms', activeForm.formId), { ...activeForm, permission: e.target.value })}
                      className="w-full border border-gray-150 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-primary outline-none bg-white cursor-pointer font-bold"
                    >
                      <option value="public">সবার জন্য উন্মুক্ত (Public)</option>
                      <option value="login_required">লগইন বাধ্যতামূলক (Login Required)</option>
                      <option value="batch_restricted">নির্দিষ্ট ব্যাচের জন্য (Batch Restricted)</option>
                    </select>
                  </div>
                  {activeForm.permission === 'batch_restricted' && (
                    <div className="space-y-1.5 animate-slide-up">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">ব্যাচ বছর (Year)</label>
                      <input 
                        type="text" 
                        placeholder="উদাঃ ২০১৫"
                        value={activeForm.restrictedBatch || ''}
                        onChange={e => setDoc(doc(db, 'forms', activeForm.formId), { ...activeForm, restrictedBatch: e.target.value })}
                        className="w-full border border-gray-150 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-1 focus:ring-primary outline-none transition"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5 pt-2 border-t border-gray-50">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">প্রকাশনা স্ট্যাটাস</label>
                    <select 
                      value={activeForm.status}
                      onChange={e => setDoc(doc(db, 'forms', activeForm.formId), { ...activeForm, status: e.target.value })}
                      className="w-full border border-gray-150 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-primary outline-none bg-white cursor-pointer font-bold"
                    >
                      <option value="active">সক্রিয় (Active)</option>
                      <option value="draft">অপ্রকাশিত (Draft/Inactive)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column: Design Area / Fields List */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeFormId && activeForm ? (
              <motion.div 
                key={activeFormId + '_design'}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8 font-sans"
              >
                {/* 3. Selected Form Design Area Header */}
                <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center space-x-5">
                    <div className="h-14 w-14 bg-gray-950 rounded-2xl flex items-center justify-center text-secondary shadow-xl shadow-gray-200">
                       <AppWindow className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-950 text-xl tracking-tight leading-none">{activeForm.title}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] bg-primary/10 text-primary font-bold uppercase rounded px-2 py-0.5 tracking-wider">ডিজাইন এরিয়া (Design Area)</span>
                        <span className="text-xs text-gray-400 font-medium">স্ল্যাগ: <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded text-indigo-600 font-bold">/{activeForm.slug}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2.5 px-5 rounded-2xl border border-gray-100 flex items-center gap-6">
                     <div className="text-center">
                        <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">সব ফিল্ড</span>
                        <span className="text-2xl font-black text-gray-950 leading-none">{activeFields.length}</span>
                     </div>
                     <div className="h-10 w-px bg-gray-200" />
                     <button 
                        onClick={() => window.open(`/forms/${activeForm.slug}`, '_blank')}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition shadow-sm cursor-pointer"
                        title="Live Preview"
                     >
                        <Eye className="h-5 w-5" />
                     </button>
                  </div>
                </div>

                {/* 4. Real-time Form Fields Design List Area */}
                <div className="bg-white rounded-3xl border border-gray-150 shadow-md overflow-hidden">
                  <div className="bg-primary/5 border-b border-primary/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                       <FileText className="h-6 w-6 text-primary" />
                       <div>
                         <h3 className="font-black text-gray-900 text-sm tracking-tight leading-none">রিয়েল-টাইম ফরম ফিল্ড ডিজাইন</h3>
                         <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Interface elements & logic data builder</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleAddField(activeForm.formId)}
                      className="bg-primary hover:bg-primary/95 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition shadow-xl shadow-primary/20 transform active:scale-95 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> কাস্টম ফিল্ড যোগ করুন
                    </button>
                  </div>

                  <div className="p-8 space-y-6">
                    {activeFields.length === 0 ? (
                      <div className="py-24 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center text-center space-y-4">
                         <div className="p-6 bg-gray-50 rounded-full">
                           <PlusCircle className="h-12 w-12 text-gray-200" />
                         </div>
                         <div className="space-y-1.5">
                           <p className="font-black text-gray-800 text-lg">ডিজাইন এরিয়া একদম খালি!</p>
                           <p className="text-xs font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">ইউজারদের থেকে কি কি ডাটা নিতে চান তা নির্দিষ্ট করতে উপরে "কাস্টম ফিল্ড যোগ করুন" বাটন ক্লিক করুন।</p>
                         </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {activeFields.map((field, idx) => (
                          <div 
                            key={field.fieldId} 
                            className="group border-2 border-gray-100 bg-white hover:border-primary/40 rounded-[28px] p-6 transition relative shadow-xs"
                          >
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                              <div className="flex-grow space-y-5">
                                 <div className="flex items-center gap-4">
                                   <div className="h-8 w-8 bg-gray-950 rounded-xl flex items-center justify-center text-[11px] font-black text-secondary shadow-md">
                                      {idx + 1}
                                   </div>
                                   <input 
                                     type="text"
                                     value={field.label}
                                     placeholder="ফিল্ড লেবেল বা নাম লিখুন..."
                                     onChange={e => handleUpdateField(field, { label: e.target.value })}
                                     className="flex-grow bg-transparent border-none text-sm font-black focus:ring-0 placeholder:text-gray-300 p-0 text-gray-900"
                                   />
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                   <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">ইনপুট টাইপ (Input Type)</label>
                                      <select 
                                        value={field.fieldType}
                                        onChange={e => handleUpdateField(field, { fieldType: e.target.value as any })}
                                        className="w-full bg-gray-100/50 border border-gray-150 rounded-2xl text-[11px] font-bold px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition cursor-pointer"
                                      >
                                        <option value="text">সাধারণ টেক্সট ইনপুট (Text)</option>
                                        <option value="number">নাম্বার ইনপুট (Number)</option>
                                        <option value="textarea">লং টেক্সট এরিয়া (Textarea)</option>
                                        <option value="dropdown">ড্রপডাউন লিস্ট (Dropdown)</option>
                                        <option value="file">ফাইল বা ছবি আপলোড (Photo/File)</option>
                                        <option value="date">তারিখ সিলেক্টর (Date Picker)</option>
                                        <option value="checkbox">চেকবক্স অপশন (Checkbox)</option>
                                      </select>
                                   </div>

                                   <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">প্লেসহোল্ডার লহায়িকা</label>
                                      <input 
                                        type="text"
                                        placeholder="পরামর্শমূলক হিলস টেক্সট..."
                                        value={field.placeholder || ''}
                                        onChange={e => handleUpdateField(field, { placeholder: e.target.value })}
                                        className="w-full bg-gray-100/50 border border-gray-150 rounded-2xl text-[11px] font-bold px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                                      />
                                   </div>
                                 </div>
                              </div>

                              <div className="flex xl:flex-col items-center justify-end gap-3 xl:pt-0 pt-5 border-t xl:border-t-0 border-gray-50 shrink-0">
                                 <button 
                                   onClick={() => handleDeleteField(field.fieldId)}
                                   className="p-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm cursor-pointer"
                                   title="Delete Field"
                                 >
                                   <Trash2 className="h-5 w-5" />
                                 </button>
                                 <div className="flex flex-row xl:flex-col gap-1.5">
                                   <button 
                                      onClick={() => idx > 0 && handleUpdateField(field, { sortOrder: activeFields[idx-1].sortOrder - 0.5 })}
                                      className="p-2 px-3 border border-gray-150 rounded-xl hover:bg-gray-50 transition text-[11px] font-black text-gray-500 bg-white disabled:bg-gray-50 disabled:opacity-30 cursor-pointer"
                                      disabled={idx === 0}
                                   >
                                      ▲
                                   </button>
                                   <button 
                                      onClick={() => idx < activeFields.length -1 && handleUpdateField(field, { sortOrder: activeFields[idx+1].sortOrder + 0.5 })}
                                      className="p-2 px-3 border border-gray-150 rounded-xl hover:bg-gray-50 transition text-[11px] font-black text-gray-500 bg-white disabled:bg-gray-50 disabled:opacity-30 cursor-pointer"
                                      disabled={idx === activeFields.length - 1}
                                   >
                                      ▼
                                   </button>
                                 </div>
                              </div>
                            </div>
                            
                            {(field.fieldType === 'dropdown' || field.fieldType === 'checkbox') && (
                              <div className="mt-5 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-2.5">
                                 <label className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                                    <ArrowRight className="h-3 w-3" />
                                    <span>ড্রপডাউন অপশনসমূহ (কমা দিয়ে ডাটাগুলো আলাদা করুন)</span>
                                 </label>
                                 <input 
                                   type="text"
                                   placeholder="উদাঃ অপশন ১, অপশন ২, অপশন ৩..."
                                   value={field.options?.join(', ') || ''}
                                   onChange={e => handleUpdateField(field, { options: e.target.value.split(',').map(s => s.trim()) })}
                                   className="w-full bg-white border border-indigo-150 rounded-xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition"
                                 />
                              </div>
                            )}

                            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
                               <label className="flex items-center space-x-3 cursor-pointer group/chk">
                                  <div className="relative flex items-center h-5 w-5">
                                    <input 
                                      type="checkbox"
                                      checked={field.required}
                                      onChange={e => handleUpdateField(field, { required: e.target.checked })}
                                      className="h-5 w-5 text-primary rounded-lg border-gray-300 focus:ring-primary/20 transition cursor-pointer"
                                    />
                                  </div>
                                  <span className="text-[10px] font-black text-gray-600 transition group-hover/chk:text-primary uppercase tracking-widest">পূরণ বাধ্যতামূলক (Required)</span>
                               </label>
                               
                               <div className="h-4 w-px bg-gray-200 hidden md:block" />
                               
                               <div className="flex items-center space-x-2">
                                  <Shield className="h-3.5 w-3.5 text-gray-300" />
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Database-key:</span>
                                  <code className="text-[10px] font-mono bg-gray-50 text-indigo-400 px-2 py-0.5 rounded-lg border border-gray-100">{field.fieldId}</code>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-5 bg-gray-950 text-white flex justify-between items-center rounded-b-3xl">
                     <p className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <ArrowRight className="h-3 w-3 text-secondary" />
                        Automated Real-time Synchronization
                     </p>
                     <div className="flex items-center space-x-2">
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-secondary">Cloud-DB Protected</span>
                     </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-100 h-[700px] flex flex-col items-center justify-center text-center p-12 space-y-8 animate-fade-in">
                <div className="relative">
                   <div className="h-28 w-28 bg-gray-100/50 text-gray-200 rounded-[32px] flex items-center justify-center -rotate-6 animate-pulse transition hover:rotate-0 duration-500">
                      <Settings className="h-14 w-14" />
                   </div>
                   <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg rotate-12">
                      <Plus className="h-6 w-6" />
                   </div>
                </div>
                <div className="space-y-3">
                   <h3 className="font-black text-gray-950 text-2xl tracking-tight leading-tight">ডিজাইন ও কনফিগারেশন এরিয়া</h3>
                   <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">বাম পাশের ডিরেক্টরি থেকে একটি কাস্টম ফরম নির্বাচন করুন। এরপর এখানে আপনি ফিল্ড যোগ করা ও সেটিংস পরিবর্তনের সকল অপশন খুঁজে পাবেন।</p>
                </div>
                <div className="flex items-center space-x-4 bg-gray-50 px-6 py-2.5 rounded-2xl border border-gray-150">
                   <div className="flex items-center space-x-2">
                      <PlusCircle className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">New Form</span>
                   </div>
                   <div className="h-4 w-px bg-gray-200" />
                   <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secured Panel</span>
                   </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden font-sans border border-white/20"
            >
              <div className="bg-gray-950 text-white p-8 relative">
                 <button 
                    onClick={() => setIsCreating(false)}
                    className="absolute top-6 right-6 text-white/50 hover:text-white transition cursor-pointer p-2"
                 >
                    <X className="h-6 w-6" />
                 </button>
                 <div className="flex items-center space-x-3 text-secondary mb-2">
                    <PlusCircle className="h-6 w-6" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">New Directory</span>
                 </div>
                 <h3 className="text-2xl font-black tracking-tight leading-tight">নতুন কাস্টম ফরম তৈরি করুন</h3>
                 <p className="text-[11px] text-white/50 mt-1 font-bold">প্রাথমিক তথ্য দিয়ে সার্ভারে নতুন ফরম ডিরেক্টরি ওপেন করুন</p>
              </div>
              <form onSubmit={handleCreateForm} className="p-8 space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">ফরমের নাম (Public Label)</label>
                   <input 
                     type="text" 
                     required
                     placeholder="উদাঃ স্মরণিকা পিকআপ পয়েন্ট ফরম"
                     value={newFormTitle}
                     onChange={e => setNewFormTitle(e.target.value)}
                     className="w-full bg-gray-50 border border-gray-150 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">ইউআরএল স্লাগ (Unique Slug)</label>
                   <input 
                     type="text" 
                     required
                     placeholder="উদাঃ souvenir-pickup"
                     value={newFormSlug}
                     onChange={e => setNewFormSlug(e.target.value)}
                     className="w-full bg-gray-50 border border-gray-150 rounded-2xl px-5 py-4 text-sm font-mono font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">সংক্ষিপ্ত বর্ণনা (Optional)</label>
                   <textarea 
                     rows={3}
                     placeholder="ফরমটি কি উদ্দেশ্যে ব্যবহার করা হবে..."
                     value={newFormDesc}
                     onChange={e => setNewFormDesc(e.target.value)}
                     className="w-full bg-gray-50 border border-gray-150 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition leading-relaxed"
                   />
                 </div>
                 <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/95 text-white font-black py-4 rounded-[40px] shadow-xl shadow-primary/20 transition transform active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <PlusCircle className="h-5 w-5" />
                      <span>সবকিছু ঠিক আছে, ফরম তৈরি করুন</span>
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
