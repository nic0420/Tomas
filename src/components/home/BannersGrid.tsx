export function BannersGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
      <div className="group overflow-hidden rounded-sm cursor-pointer relative">
        <img 
          src="https://placehold.co/600x300/e2e8f0/475569?text=AIRSOFT" 
          alt="Airsoft" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
      </div>
      <div className="group overflow-hidden rounded-sm cursor-pointer relative">
        <img 
          src="https://placehold.co/600x300/e2e8f0/475569?text=PAINTBALL" 
          alt="Paintball" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
      </div>
      <div className="group overflow-hidden rounded-sm cursor-pointer relative hidden lg:block">
        <img 
          src="https://placehold.co/600x300/e2e8f0/475569?text=ACCESORIOS" 
          alt="Accesorios" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
      </div>
    </div>
  );
}
