import React from 'react';
import { 
  Plus, 
  Trash2, 
  Image, 
  Search,
  X,
  Upload
} from 'lucide-react';
import { Gallery, CustomForm } from '../../types';

interface HistoricalPhotoUploadProps {
  gallery: Gallery[];
  customForms: CustomForm[];
  handleAddGallery: (e: React.FormEvent) => Promise<void>;
  handleDeleteGallery: (gId: string) => Promise<void>;
  newGalleryTitle: string;
  setNewGalleryTitle: (val: string) => void;
  newGalleryCat: string;
  setNewGalleryCat: (val: string) => void;
  newGalleryImg: string;
  setNewGalleryImg: (val: string) => void;
}

export const HistoricalPhotoUpload: React.FC<HistoricalPhotoUploadProps & { isModalOpen: boolean; setIsModalOpen: (val: boolean) => void }> = ({ 
  gallery, 
  customForms, 
  handleAddGallery, 
  handleDeleteGallery,
  newGalleryTitle,
  setNewGalleryTitle,
  newGalleryCat,
  setNewGalleryCat,
  newGalleryImg,
  setNewGalleryImg,
  isModalOpen,
  setIsModalOpen
}) => {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4 gap-4">
          <div className="flex items-center space-x-2">
            <Image className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-gray-800 text-sm font-sans">স্মৃতি গ্যালারি (Gallery Management)</h3>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>গ্যালারিতে নতুন ছবি আপলোড করুন</span>
          </button>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 font-sans">
          {gallery.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-medium font-sans">গ্যালারিতে কোনো ছবি এখনও আপলোড করা হয়নি।</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {gallery.sort((a,b) => (b.galleryId > a.galleryId ? 1 : -1)).map((g) => (
                <div key={g.galleryId} className="group bg-gray-50 border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition relative flex flex-col font-sans">
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition z-10">
                    <button 
                      onClick={() => handleDeleteGallery(g.galleryId)}
                      className="p-1.5 bg-white/90 backdrop-blur shadow-xs border border-gray-100 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer transition"
                      title="Delete Photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  <div className="aspect-[4/3] w-full bg-gray-200 overflow-hidden">
                    <img 
                      src={g.image} 
                      alt={g.title} 
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="p-3 leading-tight">
                    <strong className="text-gray-900 block text-[11px] truncate" title={g.title}>{g.title}</strong>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">{g.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Photo Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-scale-in">
            <div className="p-5 border-b flex justify-between items-center bg-gray-950 text-white">
              <h3 className="font-bold text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span>নতুন ছবি আপলোড করুন</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddGallery}>
              <div className="p-6 space-y-4 text-left">
                <div className="space-y-4 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">ছবির শিরোনাম (Photo Title) *</label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ রিইউনিয়ন মেগা ইভেন্ট স্মৃতি"
                      value={newGalleryTitle}
                      onChange={e => setNewGalleryTitle(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block">ক্যাটাগরি বা অ্যালবাম (Album Category)</label>
                    <select
                      value={newGalleryCat}
                      onChange={e => setNewGalleryCat(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-1 focus:ring-primary bg-white"
                    >
                      <option value="Golden Jubilee">সুবর্ণ জন্মজয়নন্তী (Golden Jubilee)</option>
                      <option value="Class Reunion">শ্রেণী পুনর্মিলনী (Class Reunion)</option>
                      <option value="Sports & Culture">খেলাধুলা ও সংস্কৃতি</option>
                      <option value="Campus Memory">ক্যাম্পাসের স্মৃতিপট</option>
                      <option value="Others">অন্যান্য অ্যালবাম</option>
                      {customForms.map(form => (
                        <option key={form.formId} value={form.title}>{form.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 block mb-2">ছবি সিলেক্ট করুন (Choose Photo) *</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition group relative overflow-hidden">
                      {newGalleryImg ? (
                        <>
                          <img src={newGalleryImg} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">ছবি পরিবর্তন করুন</div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-1 text-[11px] text-gray-500"><span className="font-bold text-primary">Click to upload</span> or drag and drop</p>
                          <p className="text-[9px] text-gray-400">PNG, JPG or WebP (MAX. 5MB)</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        required={!newGalleryImg}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewGalleryImg(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t bg-gray-50 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white border text-gray-500 hover:bg-gray-100 px-6 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white px-8 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transform active:scale-95 transition cursor-pointer"
                >
                  আপলোড করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
