// Formatting utilities
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatDateTime = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatNumber = (number, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substr(0, maxLength) + '...';
};

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const titleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

const camelCaseToTitle = (str) => {
  if (!str) return '';
  // Insert spaces before uppercase letters
  const spaced = str.replace(/([A-Z])/g, ' $1');
  // Capitalize the first letter and return
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const formatDuration = (hours) => {
  const h = Math.floor(hours);
  const mins = Math.floor((hours - h) * 60);
  if (mins > 0) {
    return `${h}h ${mins}m`;
  }
  return `${h}h`;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'operational':
    case 'active':
    case 'low':
      return 'success';
    case 'maintenance':
    case 'in_progress':
    case 'medium':
      return 'warning';
    case 'out_of_order':
    case 'on_hold':
    case 'high':
      return 'danger';
    case 'locked_down':
    case 'critical':
      return 'danger';
    case 'open':
    case 'inactive':
      return 'info';
    default:
      return 'secondary';
  }
};

export {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatNumber,
  truncateText,
  capitalize,
  titleCase,
  camelCaseToTitle,
  formatDuration,
  getStatusColor
};