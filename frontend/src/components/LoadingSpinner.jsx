export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <div className="relative w-12 h-12 mb-4">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dark-700"></div>
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin"></div>
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent/60 animate-pulse"></div>
        </div>
      </div>
      <p className="text-[12px] text-dark-500 font-medium tracking-wide">{text}</p>
    </div>
  );
}
