// components/ui/Card.js
export function Card({ 
    children, 
    className = '', 
    hover = false,
    clickable = false,
    padding = 'default',
    background = 'white',
    border = true,
    shadow = 'default',
    ...props 
  }) {
    const baseClasses = 'rounded-lg transition-all duration-200';
    
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      default: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    };
  
    const backgroundClasses = {
      white: 'bg-white',
      beige: 'bg-[#FDF0D5]',
      gray: 'bg-gray-50',
      transparent: 'bg-transparent'
    };
  
    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      default: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl'
    };
  
    const borderClasses = border ? 'border border-gray-200' : '';
    
    const hoverClasses = hover || clickable 
      ? 'hover:shadow-lg hover:scale-[1.02] hover:border-[#C1121F]/20' 
      : '';
      
    const clickableClasses = clickable 
      ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#780000] focus:ring-opacity-50' 
      : '';
  
    const combinedClasses = [
      baseClasses,
      paddingClasses[padding],
      backgroundClasses[background],
      shadowClasses[shadow],
      borderClasses,
      hoverClasses,
      clickableClasses,
      className
    ].filter(Boolean).join(' ');
  
    const Component = clickable ? 'button' : 'div';
  
    return (
      <Component
        className={combinedClasses}
        {...props}
      >
        {children}
      </Component>
    );
  }
  
  // Specialized Card variants
  export function MatchCard({ children, className = '', ...props }) {
    return (
      <Card
        className={`bg-[#FDF0D5] border-[#780000]/10 ${className}`}
        hover={true}
        clickable={true}
        {...props}
      >
        {children}
      </Card>
    );
  }
  
  export function StatCard({ title, value, subtitle, icon, className = '', ...props }) {
    return (
      <Card
        className={`text-center ${className}`}
        padding="lg"
        hover={true}
        {...props}
      >
        {icon && (
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-[#FDF0D5] rounded-full flex items-center justify-center text-[#780000]">
              {icon}
            </div>
          </div>
        )}
        <div className="text-3xl font-bold text-[#780000] mb-2">
          {value}
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {title}
        </div>
        {subtitle && (
          <div className="text-sm text-gray-600">
            {subtitle}
          </div>
        )}
      </Card>
    );
  }
  
  export function EventCard({ 
    title, 
    date, 
    location, 
    type, 
    participants, 
    maxParticipants,
    className = '',
    onJoin,
    isJoined = false,
    ...props 
  }) {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('nb-NO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
  
    const getTypeIcon = (eventType) => {
      if (eventType === 'digital') {
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      }
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    };
  
    return (
      <Card
        className={`${className}`}
        hover={true}
        {...props}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-[#780000] line-clamp-2">
            {title}
          </h3>
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            type === 'digital' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {getTypeIcon(type)}
            <span className="ml-1 capitalize">{type}</span>
          </div>
        </div>
  
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(date)}
          </div>
  
          {location && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {location}
            </div>
          )}
  
          {maxParticipants && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {participants || 0} / {maxParticipants} deltakere
            </div>
          )}
        </div>
  
        {onJoin && (
          <button
            onClick={onJoin}
            disabled={isJoined || (maxParticipants && participants >= maxParticipants)}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              isJoined
                ? 'bg-green-100 text-green-800 cursor-default'
                : maxParticipants && participants >= maxParticipants
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-[#780000] text-white hover:bg-[#C1121F]'
            }`}
          >
            {isJoined 
              ? 'Påmeldt' 
              : maxParticipants && participants >= maxParticipants
              ? 'Fullt'
              : 'Meld deg på'
            }
          </button>
        )}
      </Card>
    );
  }

  // At the very end of your components/ui/Card.js file, add:
export default Card;