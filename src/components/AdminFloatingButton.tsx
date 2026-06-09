import { Plus } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useEffect, useState } from "react";

interface AdminFloatingButtonProps {
  onClick: () => void;
}

const AdminFloatingButton = ({ onClick }: AdminFloatingButtonProps) => {
  const { isAdmin, isLoading } = useAdmin();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Debug log
    console.log('AdminFloatingButton - isAdmin:', isAdmin, 'isLoading:', isLoading);
    
    if (!isLoading && isAdmin) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  }, [isAdmin, isLoading]);

  // Always render the button but use visibility
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        width: '64px',
        height: '64px',
        backgroundColor: '#F97316',
        color: 'white',
        borderRadius: '50%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        border: '4px solid white',
        cursor: 'pointer',
        display: showButton ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title="Új csomag hozzáadása"
      aria-label="Új csomag hozzáadása"
    >
      <Plus style={{ width: '32px', height: '32px' }} />
    </button>
  );
};

export default AdminFloatingButton;
