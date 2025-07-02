export const formatUTCDateTime = (date = new Date()) => {
    try {
      const isoString = date.toISOString();
      return isoString.slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:MM:SS
    } catch (error) {
      console.error('Date formatting error:', error);
      return '0000-00-00 00:00:00';
    }
  };
  
  export const getCurrentUTCDateTime = () => {
    return formatUTCDateTime(new Date());
  };
  
  export const formatLocalDateTime = (dateString) => {
    if (!dateString) return 'Ukjent dato';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      
      return date.toLocaleDateString('nb-NO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });
    } catch (error) {
      console.error('Local date formatting error:', error);
      return 'Ugyldig dato';
    }
  };