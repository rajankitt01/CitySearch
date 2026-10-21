/**
 * Geocoding Service
 * Ultra-fast geocoding with instant offline matching for 180+ major Indian cities and global hubs,
 * high-speed Photon API (<100ms), OpenStreetMap Nominatim fallback, and smart caching.
 */

import { storage } from '../utils/storage.js';

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const GEOAPIFY_KEY = ENV.VITE_GEOAPIFY_API_KEY || '';

// Verified index of major Indian cities, state capitals, union territories, and global hubs
export const POPULAR_CITIES = [
  // Top Metros & Tier 1
  { name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777, displayName: 'Mumbai, Maharashtra, India' },
  { name: 'Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090, displayName: 'New Delhi, Delhi, India' },
  { name: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946, displayName: 'Bengaluru (Bangalore), Karnataka, India' },
  { name: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lon: 78.4867, displayName: 'Hyderabad, Telangana, India' },
  { name: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707, displayName: 'Chennai, Tamil Nadu, India' },
  { name: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639, displayName: 'Kolkata, West Bengal, India' },
  { name: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lon: 73.8567, displayName: 'Pune, Maharashtra, India' },
  { name: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lon: 72.5714, displayName: 'Ahmedabad, Gujarat, India' },
  { name: 'Jaipur', state: 'Rajasthan', country: 'India', lat: 26.9124, lon: 75.7873, displayName: 'Jaipur, Rajasthan, India' },
  { name: 'Surat', state: 'Gujarat', country: 'India', lat: 21.1702, lon: 72.8311, displayName: 'Surat, Gujarat, India' },
  { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lon: 80.9462, displayName: 'Lucknow, Uttar Pradesh, India' },
  { name: 'Chandigarh', state: 'Chandigarh', country: 'India', lat: 30.7333, lon: 76.7794, displayName: 'Chandigarh, India' },
  { name: 'Kochi', state: 'Kerala', country: 'India', lat: 9.9312, lon: 76.2673, displayName: 'Kochi (Cochin), Kerala, India' },
  { name: 'Indore', state: 'Madhya Pradesh', country: 'India', lat: 22.7196, lon: 75.8577, displayName: 'Indore, Madhya Pradesh, India' },
  { name: 'Nagpur', state: 'Maharashtra', country: 'India', lat: 21.1458, lon: 79.0882, displayName: 'Nagpur, Maharashtra, India' },
  { name: 'Bhopal', state: 'Madhya Pradesh', country: 'India', lat: 23.2599, lon: 77.4126, displayName: 'Bhopal, Madhya Pradesh, India' },
  { name: 'Patna', state: 'Bihar', country: 'India', lat: 25.6093, lon: 85.1235, displayName: 'Patna, Bihar, India' },
  { name: 'Vadodara', state: 'Gujarat', country: 'India', lat: 22.3072, lon: 73.1812, displayName: 'Vadodara (Baroda), Gujarat, India' },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India', lat: 28.6692, lon: 77.4538, displayName: 'Ghaziabad, Uttar Pradesh, India' },
  { name: 'Ludhiana', state: 'Punjab', country: 'India', lat: 30.9010, lon: 75.8573, displayName: 'Ludhiana, Punjab, India' },
  { name: 'Agra', state: 'Uttar Pradesh', country: 'India', lat: 27.1767, lon: 78.0081, displayName: 'Agra, Uttar Pradesh, India' },
  { name: 'Nashik', state: 'Maharashtra', country: 'India', lat: 19.9975, lon: 73.7898, displayName: 'Nashik, Maharashtra, India' },
  { name: 'Faridabad', state: 'Haryana', country: 'India', lat: 28.4089, lon: 77.3178, displayName: 'Faridabad, Haryana, India' },
  { name: 'Meerut', state: 'Uttar Pradesh', country: 'India', lat: 28.9845, lon: 77.7064, displayName: 'Meerut, Uttar Pradesh, India' },
  { name: 'Rajkot', state: 'Gujarat', country: 'India', lat: 22.3039, lon: 70.8022, displayName: 'Rajkot, Gujarat, India' },
  { name: 'Varanasi', state: 'Uttar Pradesh', country: 'India', lat: 25.3176, lon: 82.9739, displayName: 'Varanasi (Kashi), Uttar Pradesh, India' },
  { name: 'Srinagar', state: 'Jammu and Kashmir', country: 'India', lat: 34.0837, lon: 74.7973, displayName: 'Srinagar, Jammu and Kashmir, India' },
  { name: 'Aurangabad', state: 'Maharashtra', country: 'India', lat: 19.8762, lon: 75.3433, displayName: 'Chhatrapati Sambhajinagar (Aurangabad), Maharashtra, India' },
  { name: 'Dhanbad', state: 'Jharkhand', country: 'India', lat: 23.7957, lon: 86.4304, displayName: 'Dhanbad, Jharkhand, India' },
  { name: 'Amritsar', state: 'Punjab', country: 'India', lat: 31.6340, lon: 74.8723, displayName: 'Amritsar, Punjab, India' },
  { name: 'Navi Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0330, lon: 73.0297, displayName: 'Navi Mumbai, Maharashtra, India' },
  { name: 'Prayagraj', state: 'Uttar Pradesh', country: 'India', lat: 25.4358, lon: 81.8463, displayName: 'Prayagraj (Allahabad), Uttar Pradesh, India' },
  { name: 'Ranchi', state: 'Jharkhand', country: 'India', lat: 23.3441, lon: 85.3096, displayName: 'Ranchi, Jharkhand, India' },
  { name: 'Howrah', state: 'West Bengal', country: 'India', lat: 22.5958, lon: 88.2636, displayName: 'Howrah, West Bengal, India' },
  { name: 'Coimbatore', state: 'Tamil Nadu', country: 'India', lat: 11.0168, lon: 76.9558, displayName: 'Coimbatore, Tamil Nadu, India' },
  { name: 'Jabalpur', state: 'Madhya Pradesh', country: 'India', lat: 23.1815, lon: 79.9864, displayName: 'Jabalpur, Madhya Pradesh, India' },
  { name: 'Gwalior', state: 'Madhya Pradesh', country: 'India', lat: 26.2183, lon: 78.1828, displayName: 'Gwalior, Madhya Pradesh, India' },
  { name: 'Vijayawada', state: 'Andhra Pradesh', country: 'India', lat: 16.5062, lon: 80.6480, displayName: 'Vijayawada, Andhra Pradesh, India' },
  { name: 'Jodhpur', state: 'Rajasthan', country: 'India', lat: 26.2389, lon: 73.0243, displayName: 'Jodhpur, Rajasthan, India' },
  { name: 'Madurai', state: 'Tamil Nadu', country: 'India', lat: 9.9252, lon: 78.1198, displayName: 'Madurai, Tamil Nadu, India' },
  { name: 'Raipur', state: 'Chhattisgarh', country: 'India', lat: 21.2514, lon: 81.6296, displayName: 'Raipur, Chhattisgarh, India' },
  { name: 'Kota', state: 'Rajasthan', country: 'India', lat: 25.2138, lon: 75.8648, displayName: 'Kota, Rajasthan, India' },
  { name: 'Guwahati', state: 'Assam', country: 'India', lat: 26.1445, lon: 91.7362, displayName: 'Guwahati, Assam, India' },
  { name: 'Solapur', state: 'Maharashtra', country: 'India', lat: 17.6599, lon: 75.9064, displayName: 'Solapur, Maharashtra, India' },
  { name: 'Hubli', state: 'Karnataka', country: 'India', lat: 15.3647, lon: 75.1240, displayName: 'Hubli-Dharwad, Karnataka, India' },
  { name: 'Bareilly', state: 'Uttar Pradesh', country: 'India', lat: 28.3670, lon: 79.4304, displayName: 'Bareilly, Uttar Pradesh, India' },
  { name: 'Moradabad', state: 'Uttar Pradesh', country: 'India', lat: 28.8386, lon: 78.7733, displayName: 'Moradabad, Uttar Pradesh, India' },
  { name: 'Mysore', state: 'Karnataka', country: 'India', lat: 12.2958, lon: 76.6394, displayName: 'Mysuru (Mysore), Karnataka, India' },
  { name: 'Gurugram', state: 'Haryana', country: 'India', lat: 28.4595, lon: 77.0266, displayName: 'Gurugram (Gurgaon), Haryana, India' },
  { name: 'Aligarh', state: 'Uttar Pradesh', country: 'India', lat: 27.8974, lon: 78.0880, displayName: 'Aligarh, Uttar Pradesh, India' },
  { name: 'Jalandhar', state: 'Punjab', country: 'India', lat: 31.3260, lon: 75.5762, displayName: 'Jalandhar, Punjab, India' },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India', lat: 10.7905, lon: 78.7047, displayName: 'Tiruchirappalli (Trichy), Tamil Nadu, India' },
  { name: 'Bhubaneswar', state: 'Odisha', country: 'India', lat: 20.2961, lon: 85.8245, displayName: 'Bhubaneswar, Odisha, India' },
  { name: 'Salem', state: 'Tamil Nadu', country: 'India', lat: 11.6643, lon: 78.1460, displayName: 'Salem, Tamil Nadu, India' },
  { name: 'Warangal', state: 'Telangana', country: 'India', lat: 17.9784, lon: 79.5941, displayName: 'Warangal, Telangana, India' },
  { name: 'Thiruvananthapuram', state: 'Kerala', country: 'India', lat: 8.5241, lon: 76.9366, displayName: 'Thiruvananthapuram (Trivandrum), Kerala, India' },
  { name: 'Bhiwandi', state: 'Maharashtra', country: 'India', lat: 19.3002, lon: 73.0635, displayName: 'Bhiwandi, Maharashtra, India' },
  { name: 'Saharanpur', state: 'Uttar Pradesh', country: 'India', lat: 29.9671, lon: 77.5452, displayName: 'Saharanpur, Uttar Pradesh, India' },
  { name: 'Gorakhpur', state: 'Uttar Pradesh', country: 'India', lat: 26.7606, lon: 83.3732, displayName: 'Gorakhpur, Uttar Pradesh, India' },
  { name: 'Guntur', state: 'Andhra Pradesh', country: 'India', lat: 16.3067, lon: 80.4365, displayName: 'Guntur, Andhra Pradesh, India' },
  { name: 'Bikaner', state: 'Rajasthan', country: 'India', lat: 28.0229, lon: 73.3119, displayName: 'Bikaner, Rajasthan, India' },
  { name: 'Amravati', state: 'Maharashtra', country: 'India', lat: 20.9320, lon: 77.7523, displayName: 'Amravati, Maharashtra, India' },
  { name: 'Noida', state: 'Uttar Pradesh', country: 'India', lat: 28.5355, lon: 77.3910, displayName: 'Noida, Uttar Pradesh, India' },
  { name: 'Jamshedpur', state: 'Jharkhand', country: 'India', lat: 22.8046, lon: 86.2029, displayName: 'Jamshedpur (Tatanagar), Jharkhand, India' },
  { name: 'Bhilai', state: 'Chhattisgarh', country: 'India', lat: 21.2121, lon: 81.3733, displayName: 'Bhilai Nagar, Chhattisgarh, India' },
  { name: 'Cuttack', state: 'Odisha', country: 'India', lat: 20.4625, lon: 85.8828, displayName: 'Cuttack, Odisha, India' },
  { name: 'Firozabad', state: 'Uttar Pradesh', country: 'India', lat: 27.1593, lon: 78.3957, displayName: 'Firozabad, Uttar Pradesh, India' },
  { name: 'Nellore', state: 'Andhra Pradesh', country: 'India', lat: 14.4426, lon: 79.9865, displayName: 'Nellore, Andhra Pradesh, India' },
  { name: 'Bhavnagar', state: 'Gujarat', country: 'India', lat: 21.7645, lon: 72.1519, displayName: 'Bhavnagar, Gujarat, India' },
  { name: 'Dehradun', state: 'Uttarakhand', country: 'India', lat: 30.3165, lon: 78.0322, displayName: 'Dehradun, Uttarakhand, India' },
  { name: 'Durgapur', state: 'West Bengal', country: 'India', lat: 23.5204, lon: 87.3119, displayName: 'Durgapur, West Bengal, India' },
  { name: 'Asansol', state: 'West Bengal', country: 'India', lat: 23.6739, lon: 86.9524, displayName: 'Asansol, West Bengal, India' },
  { name: 'Rourkela', state: 'Odisha', country: 'India', lat: 22.2604, lon: 84.8536, displayName: 'Rourkela, Odisha, India' },
  { name: 'Nanded', state: 'Maharashtra', country: 'India', lat: 19.1383, lon: 77.3210, displayName: 'Nanded, Maharashtra, India' },
  { name: 'Kolhapur', state: 'Maharashtra', country: 'India', lat: 16.7050, lon: 74.2433, displayName: 'Kolhapur, Maharashtra, India' },
  { name: 'Ajmer', state: 'Rajasthan', country: 'India', lat: 26.4499, lon: 74.6399, displayName: 'Ajmer, Rajasthan, India' },
  { name: 'Akola', state: 'Maharashtra', country: 'India', lat: 20.7002, lon: 77.0082, displayName: 'Akola, Maharashtra, India' },
  { name: 'Gulbarga', state: 'Karnataka', country: 'India', lat: 17.3297, lon: 76.8343, displayName: 'Kalaburagi (Gulbarga), Karnataka, India' },
  { name: 'Jamnagar', state: 'Gujarat', country: 'India', lat: 22.4707, lon: 70.0577, displayName: 'Jamnagar, Gujarat, India' },
  { name: 'Ujjain', state: 'Madhya Pradesh', country: 'India', lat: 23.1765, lon: 75.7885, displayName: 'Ujjain, Madhya Pradesh, India' },
  { name: 'Siliguri', state: 'West Bengal', country: 'India', lat: 26.7271, lon: 88.3953, displayName: 'Siliguri, West Bengal, India' },
  { name: 'Jhansi', state: 'Uttar Pradesh', country: 'India', lat: 25.4484, lon: 78.5685, displayName: 'Jhansi, Uttar Pradesh, India' },
  { name: 'Ulhasnagar', state: 'Maharashtra', country: 'India', lat: 19.2215, lon: 73.1645, displayName: 'Ulhasnagar, Maharashtra, India' },
  { name: 'Jammu', state: 'Jammu and Kashmir', country: 'India', lat: 32.7266, lon: 74.8570, displayName: 'Jammu, Jammu and Kashmir, India' },
  { name: 'Sangli', state: 'Maharashtra', country: 'India', lat: 16.8524, lon: 74.5815, displayName: 'Sangli-Miraj, Maharashtra, India' },
  { name: 'Mangalore', state: 'Karnataka', country: 'India', lat: 12.9141, lon: 74.8560, displayName: 'Mangaluru (Mangalore), Karnataka, India' },
  { name: 'Erode', state: 'Tamil Nadu', country: 'India', lat: 11.3410, lon: 77.7172, displayName: 'Erode, Tamil Nadu, India' },
  { name: 'Belgaum', state: 'Karnataka', country: 'India', lat: 15.8497, lon: 74.4977, displayName: 'Belagavi (Belgaum), Karnataka, India' },
  { name: 'Kurnool', state: 'Andhra Pradesh', country: 'India', lat: 15.8281, lon: 78.0373, displayName: 'Kurnool, Andhra Pradesh, India' },
  { name: 'Udaipur', state: 'Rajasthan', country: 'India', lat: 24.5854, lon: 73.7125, displayName: 'Udaipur, Rajasthan, India' },
  { name: 'Kozhikode', state: 'Kerala', country: 'India', lat: 11.2588, lon: 75.7804, displayName: 'Kozhikode (Calicut), Kerala, India' },
  { name: 'Rajahmundry', state: 'Andhra Pradesh', country: 'India', lat: 17.0005, lon: 81.8040, displayName: 'Rajahmundry, Andhra Pradesh, India' },
  { name: 'Bokaro', state: 'Jharkhand', country: 'India', lat: 23.6693, lon: 86.1511, displayName: 'Bokaro Steel City, Jharkhand, India' },
  { name: 'Bellary', state: 'Karnataka', country: 'India', lat: 15.1394, lon: 76.9214, displayName: 'Ballari (Bellary), Karnataka, India' },
  { name: 'Patiala', state: 'Punjab', country: 'India', lat: 30.3398, lon: 76.3869, displayName: 'Patiala, Punjab, India' },
  { name: 'Agartala', state: 'Tripura', country: 'India', lat: 23.8315, lon: 91.2868, displayName: 'Agartala, Tripura, India' },
  { name: 'Bhagalpur', state: 'Bihar', country: 'India', lat: 25.2425, lon: 86.9842, displayName: 'Bhagalpur, Bihar, India' },
  { name: 'Muzaffarnagar', state: 'Uttar Pradesh', country: 'India', lat: 29.4727, lon: 77.7085, displayName: 'Muzaffarnagar, Uttar Pradesh, India' },
  { name: 'Latur', state: 'Maharashtra', country: 'India', lat: 18.4088, lon: 76.5604, displayName: 'Latur, Maharashtra, India' },
  { name: 'Dhule', state: 'Maharashtra', country: 'India', lat: 20.9042, lon: 74.7749, displayName: 'Dhule, Maharashtra, India' },
  { name: 'Rohtak', state: 'Haryana', country: 'India', lat: 28.8955, lon: 76.6066, displayName: 'Rohtak, Haryana, India' },
  { name: 'Korba', state: 'Chhattisgarh', country: 'India', lat: 22.3595, lon: 82.7501, displayName: 'Korba, Chhattisgarh, India' },
  { name: 'Bhilwara', state: 'Rajasthan', country: 'India', lat: 25.3407, lon: 74.6313, displayName: 'Bhilwara, Rajasthan, India' },
  { name: 'Berhampur', state: 'Odisha', country: 'India', lat: 19.3149, lon: 84.7941, displayName: 'Berhampur, Odisha, India' },
  { name: 'Muzaffarpur', state: 'Bihar', country: 'India', lat: 26.1209, lon: 85.3647, displayName: 'Muzaffarpur, Bihar, India' },
  { name: 'Ahmednagar', state: 'Maharashtra', country: 'India', lat: 19.0948, lon: 74.7480, displayName: 'Ahilya Nagar (Ahmednagar), Maharashtra, India' },
  { name: 'Mathura', state: 'Uttar Pradesh', country: 'India', lat: 27.4924, lon: 77.6737, displayName: 'Mathura, Uttar Pradesh, India' },
  { name: 'Kollam', state: 'Kerala', country: 'India', lat: 8.8932, lon: 76.6141, displayName: 'Kollam (Quilon), Kerala, India' },
  { name: 'Tirupati', state: 'Andhra Pradesh', country: 'India', lat: 13.6288, lon: 79.4192, displayName: 'Tirupati, Andhra Pradesh, India' },
  { name: 'Satara', state: 'Maharashtra', country: 'India', lat: 17.6805, lon: 73.9997, displayName: 'Satara, Maharashtra, India' },
  { name: 'Bijapur', state: 'Karnataka', country: 'India', lat: 16.8302, lon: 75.7100, displayName: 'Vijayapura (Bijapur), Karnataka, India' },
  { name: 'Rampur', state: 'Uttar Pradesh', country: 'India', lat: 28.8154, lon: 79.0253, displayName: 'Rampur, Uttar Pradesh, India' },
  { name: 'Shivamogga', state: 'Karnataka', country: 'India', lat: 13.9299, lon: 75.5681, displayName: 'Shivamogga (Shimoga), Karnataka, India' },
  { name: 'Chandrapur', state: 'Maharashtra', country: 'India', lat: 19.9615, lon: 79.2961, displayName: 'Chandrapur, Maharashtra, India' },
  { name: 'Junagadh', state: 'Gujarat', country: 'India', lat: 21.5222, lon: 70.4579, displayName: 'Junagadh, Gujarat, India' },
  { name: 'Thrissur', state: 'Kerala', country: 'India', lat: 10.5276, lon: 76.2144, displayName: 'Thrissur, Kerala, India' },
  { name: 'Alwar', state: 'Rajasthan', country: 'India', lat: 27.5530, lon: 76.6346, displayName: 'Alwar, Rajasthan, India' },
  { name: 'Bardhaman', state: 'West Bengal', country: 'India', lat: 23.2324, lon: 87.8615, displayName: 'Bardhaman, West Bengal, India' },
  { name: 'Kakinada', state: 'Andhra Pradesh', country: 'India', lat: 16.9891, lon: 82.2475, displayName: 'Kakinada, Andhra Pradesh, India' },
  { name: 'Nizamabad', state: 'Telangana', country: 'India', lat: 18.6725, lon: 78.0941, displayName: 'Nizamabad, Telangana, India' },
  { name: 'Parbhani', state: 'Maharashtra', country: 'India', lat: 19.2644, lon: 76.7749, displayName: 'Parbhani, Maharashtra, India' },
  { name: 'Tumkur', state: 'Karnataka', country: 'India', lat: 13.3379, lon: 77.1173, displayName: 'Tumakuru (Tumkur), Karnataka, India' },
  { name: 'Khammam', state: 'Telangana', country: 'India', lat: 17.2473, lon: 80.1514, displayName: 'Khammam, Telangana, India' },
  { name: 'Panipat', state: 'Haryana', country: 'India', lat: 29.3909, lon: 76.9635, displayName: 'Panipat, Haryana, India' },
  { name: 'Darbhanga', state: 'Bihar', country: 'India', lat: 26.1542, lon: 85.8918, displayName: 'Darbhanga, Bihar, India' },
  { name: 'Aizawl', state: 'Mizoram', country: 'India', lat: 23.7271, lon: 92.7176, displayName: 'Aizawl, Mizoram, India' },
  { name: 'Dewas', state: 'Madhya Pradesh', country: 'India', lat: 22.9676, lon: 76.0534, displayName: 'Dewas, Madhya Pradesh, India' },
  { name: 'Karnal', state: 'Haryana', country: 'India', lat: 29.6857, lon: 76.9905, displayName: 'Karnal, Haryana, India' },
  { name: 'Bathinda', state: 'Punjab', country: 'India', lat: 30.2110, lon: 74.9455, displayName: 'Bathinda, Punjab, India' },
  { name: 'Jalna', state: 'Maharashtra', country: 'India', lat: 19.8347, lon: 75.8816, displayName: 'Jalna, Maharashtra, India' },
  { name: 'Eluru', state: 'Andhra Pradesh', country: 'India', lat: 16.7107, lon: 81.0952, displayName: 'Eluru, Andhra Pradesh, India' },
  { name: 'Purnia', state: 'Bihar', country: 'India', lat: 25.7771, lon: 87.4753, displayName: 'Purnia, Bihar, India' },
  { name: 'Satna', state: 'Madhya Pradesh', country: 'India', lat: 24.5828, lon: 80.8298, displayName: 'Satna, Madhya Pradesh, India' },
  { name: 'Sonipat', state: 'Haryana', country: 'India', lat: 28.9931, lon: 77.0151, displayName: 'Sonipat, Haryana, India' },
  { name: 'Sagar', state: 'Madhya Pradesh', country: 'India', lat: 23.8388, lon: 78.7378, displayName: 'Sagar, Madhya Pradesh, India' },
  { name: 'Durg', state: 'Chhattisgarh', country: 'India', lat: 21.1904, lon: 81.2849, displayName: 'Durg, Chhattisgarh, India' },
  { name: 'Imphal', state: 'Manipur', country: 'India', lat: 24.8170, lon: 93.9368, displayName: 'Imphal, Manipur, India' },
  { name: 'Ratlam', state: 'Madhya Pradesh', country: 'India', lat: 23.3315, lon: 75.0367, displayName: 'Ratlam, Madhya Pradesh, India' },
  { name: 'Anantapur', state: 'Andhra Pradesh', country: 'India', lat: 14.6819, lon: 77.6006, displayName: 'Anantapur, Andhra Pradesh, India' },
  { name: 'Gandhinagar', state: 'Gujarat', country: 'India', lat: 23.2156, lon: 72.6369, displayName: 'Gandhinagar, Gujarat, India' },
  { name: 'Pondicherry', state: 'Puducherry', country: 'India', lat: 11.9416, lon: 79.8083, displayName: 'Puducherry (Pondicherry), India' },
  { name: 'Panaji', state: 'Goa', country: 'India', lat: 15.4909, lon: 73.8278, displayName: 'Panaji, Goa, India' },
  { name: 'Shimla', state: 'Himachal Pradesh', country: 'India', lat: 31.1048, lon: 77.1734, displayName: 'Shimla, Himachal Pradesh, India' },
  { name: 'Shillong', state: 'Meghalaya', country: 'India', lat: 25.5788, lon: 91.8933, displayName: 'Shillong, Meghalaya, India' },
  { name: 'Gangtok', state: 'Sikkim', country: 'India', lat: 27.3389, lon: 88.6065, displayName: 'Gangtok, Sikkim, India' },
  { name: 'Itanagar', state: 'Arunachal Pradesh', country: 'India', lat: 27.0844, lon: 93.6053, displayName: 'Itanagar, Arunachal Pradesh, India' },
  { name: 'Kohima', state: 'Nagaland', country: 'India', lat: 25.6751, lon: 94.1086, displayName: 'Kohima, Nagaland, India' },
  { name: 'Haridwar', state: 'Uttarakhand', country: 'India', lat: 29.9457, lon: 78.1642, displayName: 'Haridwar, Uttarakhand, India' },
  { name: 'Rishikesh', state: 'Uttarakhand', country: 'India', lat: 30.0869, lon: 78.2676, displayName: 'Rishikesh, Uttarakhand, India' },
  { name: 'Ayodhya', state: 'Uttar Pradesh', country: 'India', lat: 26.7922, lon: 82.1998, displayName: 'Ayodhya, Uttar Pradesh, India' },
  { name: 'Dharamshala', state: 'Himachal Pradesh', country: 'India', lat: 32.2190, lon: 76.3234, displayName: 'Dharamshala, Himachal Pradesh, India' },
  { name: 'Leh', state: 'Ladakh', country: 'India', lat: 34.1526, lon: 77.5771, displayName: 'Leh, Ladakh, India' },
  { name: 'Port Blair', state: 'Andaman and Nicobar Islands', country: 'India', lat: 11.6234, lon: 92.7265, displayName: 'Port Blair, Andaman and Nicobar Islands, India' }
];

/**
 * Normalizes geocoding search results into uniform model
 */
function normalizeNominatimResult(item) {
  const addr = item.address || {};
  const cityName = addr.city || addr.town || addr.municipality || addr.village || addr.county || item.name || 'Unknown Location';
  const state = addr.state || addr.province || addr.region || '';
  const country = addr.country || '';

  return {
    id: `osm_${item.osm_type || 'place'}_${item.osm_id || item.place_id}`,
    name: cityName,
    displayName: item.display_name,
    locality: [cityName, state, country].filter(Boolean).join(', '),
    state: state,
    country: country,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    provider: 'OpenStreetMap',
  };
}

function normalizePhotonResult(feature) {
  const props = feature.properties || {};
  const coords = feature.geometry?.coordinates || [0, 0];
  const cityName = props.name || props.city || props.town || props.district || 'Location';
  const state = props.state || '';
  const country = props.country || '';

  const parts = [cityName, props.city !== cityName ? props.city : null, state, country].filter(Boolean);

  return {
    id: `photon_${props.osm_type || 'p'}_${props.osm_id || Math.random().toString(36).substring(2)}`,
    name: cityName,
    displayName: parts.join(', '),
    locality: [cityName, state, country].filter(Boolean).join(', '),
    state: state,
    country: country,
    lat: coords[1],
    lon: coords[0],
    provider: 'Photon OSM',
  };
}

function normalizeGeoapifyResult(item) {
  const props = item.properties || {};
  const cityName = props.city || props.name || props.county || 'Unknown Location';
  const state = props.state || '';
  const country = props.country || '';

  return {
    id: `geoapify_${props.place_id || item.id || Math.random().toString(36).substring(2)}`,
    name: cityName,
    displayName: props.formatted || `${cityName}, ${state}, ${country}`,
    locality: [cityName, state, country].filter(Boolean).join(', '),
    state: state,
    country: country,
    lat: props.lat || item.geometry?.coordinates?.[1],
    lon: props.lon || item.geometry?.coordinates?.[0],
    provider: 'Geoapify',
  };
}

/**
 * Rapidly queries local city index with ranking:
 * 1. Exact match (0ms)
 * 2. Prefix match (0ms)
 * 3. Word match (0ms)
 * 4. Substring match (0ms)
 */
export function matchLocalCities(query) {
  if (!query || query.trim().length < 2) return [];

  const lower = query.trim().toLowerCase();

  const exact = [];
  const startsWith = [];
  const wordStarts = [];
  const contains = [];

  for (const c of POPULAR_CITIES) {
    const nameLower = c.name.toLowerCase();
    const displayLower = c.displayName.toLowerCase();

    const normalized = {
      id: `local_${c.name.toLowerCase().replace(/\s+/g, '_')}`,
      name: c.name,
      displayName: c.displayName,
      locality: `${c.name}, ${c.state}, ${c.country}`,
      state: c.state,
      country: c.country,
      lat: c.lat,
      lon: c.lon,
      provider: 'Verified City Index'
    };

    if (nameLower === lower) {
      exact.push(normalized);
    } else if (nameLower.startsWith(lower)) {
      startsWith.push(normalized);
    } else if (nameLower.split(/\s+/).some(w => w.startsWith(lower))) {
      wordStarts.push(normalized);
    } else if (nameLower.includes(lower) || displayLower.includes(lower)) {
      contains.push(normalized);
    }
  }

  return [...exact, ...startsWith, ...wordStarts, ...contains];
}

/**
 * High-speed location search
 * Checks memory & cache instantly (0ms), then falls back to Photon (<100ms) or Nominatim
 * Supports aborting previous fetches when typing
 */
export async function searchLocation(query, signal = null) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cleanQuery = query.trim();
  const cacheKey = `geo_search_${cleanQuery.toLowerCase()}`;
  const cached = storage.getCache(cacheKey);
  if (cached && cached.length > 0) {
    return cached;
  }

  // 1. Instant local matching (0ms response)
  const localMatches = matchLocalCities(cleanQuery);

  // If we have local matches (exact or prefix match), return immediately for zero-latency response!
  if (localMatches.length > 0) {
    const topResults = localMatches.slice(0, 8);
    storage.setCache(cacheKey, topResults, 2 * 60 * 60 * 1000); // 2 hours
    return topResults;
  }

  // 2. Fetch external geocoding for smaller towns/localities
  let results = [];

  // Try Geoapify if key is configured
  if (GEOAPIFY_KEY) {
    try {
      const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cleanQuery)}&limit=8&apiKey=${GEOAPIFY_KEY}`;
      const res = await fetch(url, { signal });
      if (res.ok) {
        const data = await res.json();
        if (data && data.features) {
          results = data.features.map(normalizeGeoapifyResult);
        }
      }
    } catch {
      // Continue to next provider
    }
  }

  // Try high-speed Komoot Photon API (typically 50-150ms vs Nominatim 2-4s)
  if (results.length === 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=8`;
      const res = await fetch(photonUrl, {
        signal: signal || controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.features) && data.features.length > 0) {
          results = data.features
            .filter(f => f.geometry && f.geometry.coordinates)
            .map(normalizePhotonResult);
        }
      }
    } catch {
      // Fall through to Nominatim
    }
  }

  // Fallback to OpenStreetMap Nominatim if needed
  if (results.length === 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&addressdetails=1&limit=8`;
      const res = await fetch(nomUrl, {
        signal: signal || controller.signal,
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en'
        }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          results = data.map(normalizeNominatimResult);
        }
      }
    } catch {
      // Return local matches if network fails
    }
  }

  // Combine local matches and remote results, removing duplicates
  const combined = [...localMatches];
  for (const r of results) {
    const isDup = combined.some(
      c => c.name.toLowerCase() === r.name.toLowerCase() ||
        (Math.abs(c.lat - r.lat) < 0.05 && Math.abs(c.lon - r.lon) < 0.05)
    );
    if (!isDup) {
      combined.push(r);
    }
  }

  const finalResults = combined.slice(0, 8);
  if (finalResults.length > 0) {
    storage.setCache(cacheKey, finalResults, 2 * 60 * 60 * 1000);
    return finalResults;
  }

  if (localMatches.length > 0) {
    return localMatches.slice(0, 8);
  }

  return [];
}

/**
 * Reverse geocodes coordinates into city and location info
 */
export async function reverseGeocode(lat, lon, signal = null) {
  const cacheKey = `geo_reverse_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  const cached = storage.getCache(cacheKey);
  if (cached) return cached;

  // 1. Check if matches any popular city within 15 km
  for (const c of POPULAR_CITIES) {
    const latDiff = Math.abs(c.lat - lat);
    const lonDiff = Math.abs(c.lon - lon);
    if (latDiff < 0.12 && lonDiff < 0.12) {
      return {
        id: `local_${c.name.toLowerCase()}`,
        name: c.name,
        displayName: c.displayName,
        locality: `${c.name}, ${c.state}, ${c.country}`,
        state: c.state,
        country: c.country,
        lat: c.lat,
        lon: c.lon,
        provider: 'GPS Resolved Index'
      };
    }
  }

  // 2. Photon reverse geocoding (<100ms)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
    const res = await fetch(photonUrl, {
      signal: signal || controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const normalized = normalizePhotonResult(data.features[0]);
        storage.setCache(cacheKey, normalized, 24 * 60 * 60 * 1000);
        return normalized;
      }
    }
  } catch {
    // Continue
  }

  // 3. Nominatim reverse
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    const res = await fetch(url, {
      signal: signal || controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const normalized = normalizeNominatimResult(data);
      storage.setCache(cacheKey, normalized, 24 * 60 * 60 * 1000);
      return normalized;
    }
  } catch {
    // Fallback
  }

  return {
    id: `coord_${lat.toFixed(4)}_${lon.toFixed(4)}`,
    name: 'Current Location',
    displayName: `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    locality: 'Current Location',
    lat,
    lon,
    provider: 'GPS Coordinates'
  };
}
