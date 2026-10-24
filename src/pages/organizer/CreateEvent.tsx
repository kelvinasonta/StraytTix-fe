import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import OrganizerDashboardLayout from '../../components/layout/OrganizerDashboardLayout';
import { eventApi, extractNameOrString } from '../../api/events';
import { uploadApi } from '../../api/upload';
import { getApiErrorMessage } from '../../api/client';
import RichTextEditor from '../../components/ui/RichTextEditor';
import MapPinPicker from '../../components/ui/MapPinPicker';
import VenueAutocompleteInput from '../../components/ui/VenueAutocompleteInput';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { countriesApi, type Country, DEFAULT_COUNTRIES } from '../../api/countries';
import { formatDate, formatEventDateTime } from '../../utils/format';
import type { ScheduleSession, LineupMember } from '../../types/api';
import HeroHeaderPicker, { type HeroBannerStyle } from '../../components/events/HeroHeaderPicker';
import { resolveOrganizerRole, getRolePermissions } from '../../utils/permissions';
import {
  Calendar,
  MapPin,
  Ticket,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Check,
  FileText,
  Clock,
  Compass,
  CheckCircle2,
  Copy,
  Radio,
  Loader2,
  ChevronRight,
  Flame,
  Info,
  Navigation,
  Crosshair,
  ExternalLink,
  RefreshCw,
  Rocket,
  Music,
  Cpu,
  Briefcase,
  Wine,
  Palette,
  Utensils,
  Upload,
  Image as ImageIcon,
  User,
  X,
  Search,
  AlertCircle,
  ChevronDown,
  Globe,
  Users,
  Tag,
  Layers,
  MinusCircle,
  Share2,
  Video
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Event Details', subtitle: 'Title & Format', icon: FileText },
  { id: 2, label: 'Location', subtitle: 'Venue or Stream', icon: MapPin },
  { id: 3, label: 'Schedule', subtitle: 'Time & Duration', icon: Clock },
  { id: 4, label: 'Lineup & Speakers', subtitle: 'Speakers & Guests', icon: Users },
  { id: 5, label: 'Appearance & Launch', subtitle: 'Cover & Launch', icon: Sparkles },
];

export const EVENT_FORMATS = [
  'Conference',
  'Concert',
  'Festival',
  'Summit',
  'Workshop',
  'Exhibition',
  'Party',
  'Meetup',
  'Webinar',
  'Sports Tournament'
];

export const POPULAR_CATEGORY_TAGS = [
  'Technology',
  'Cloud',
  'AI',
  'Software',
  'DevOps',
  'Music',
  'Business',
  'Nightlife',
  'Arts',
  'Food & Drinks',
  'Sports',
  'Community'
];

export const SYSTEM_AVATARS = [
  {
    id: 'av-1',
    name: 'Executive Woman',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-2',
    name: 'Professional Man',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-3',
    name: 'Tech Lead Male',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-4',
    name: 'Creative Woman',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-5',
    name: 'Keynote Speaker',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-6',
    name: 'Design Lead',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-7',
    name: 'Founder Woman',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-8',
    name: 'Scientist / Engineer',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-9',
    name: 'Host / MC',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-10',
    name: 'Panelist Man',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-11',
    name: 'Product Lead',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'av-12',
    name: 'Community Host',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80'
  }
];

export const PRESET_CATEGORIES = [
  'All',
  'Music',
  'Technology',
  'Business',
  'Nightlife',
  'Arts',
  'Food & Drinks',
  'Sports',
  'Community'
];

export const PRESET_COVERS = [
  // --- MUSIC & CONCERTS (8) ---
  {
    name: 'Concert & Live Arena Stage',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    category: 'Music'
  },
  {
    name: 'Mega Festival & Crowd Lights',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    category: 'Music'
  },
  {
    name: 'Acoustic Guitar & Vocals',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    category: 'Music'
  },
  {
    name: 'EDM Electronic Rave Stage',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    category: 'Music'
  },
  {
    name: 'Late Night Jazz & Saxophone',
    url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
    category: 'Music'
  },
  {
    name: 'Stadium Rock & Pyro Spectacle',
    url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80',
    category: 'Music'
  },
  {
    name: 'Afrobeats Live Performance',
    url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    category: 'Music'
  },
  {
    name: 'Symphony Hall & Classical Strings',
    url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
    category: 'Music'
  },

  // --- TECHNOLOGY & AI (7) ---
  {
    name: 'Tech Summit & AI Keynote',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    category: 'Technology'
  },
  {
    name: 'Cybersecurity & Code Terminal',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    category: 'Technology'
  },
  {
    name: 'Developer Hackathon Sprint',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    category: 'Technology'
  },
  {
    name: 'Next-Gen AI & Robotics Lab',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    category: 'Technology'
  },
  {
    name: 'Cloud Infrastructure & Datacenter',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    category: 'Technology'
  },
  {
    name: 'Web3 & Decentralized Future',
    url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    category: 'Technology'
  },
  {
    name: 'Virtual Reality & Metaverse Hall',
    url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=1200&q=80',
    category: 'Technology'
  },

  // --- BUSINESS & CONFERENCES (7) ---
  {
    name: 'Global Leadership Convention',
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    category: 'Business'
  },
  {
    name: 'FinTech & Capital Markets Forum',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    category: 'Business'
  },
  {
    name: 'Venture Capital Startup Pitch',
    url: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?auto=format&fit=crop&w=1200&q=80',
    category: 'Business'
  },
  {
    name: 'Executive Boardroom Strategy',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    category: 'Business'
  },
  {
    name: 'Global Trade & Expo Pavilion',
    url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1200&q=80',
    category: 'Business'
  },
  {
    name: 'Digital Marketing & Growth Summit',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    category: 'Business'
  },
  {
    name: 'Executive Women in Business',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    category: 'Business'
  },

  // --- NIGHTLIFE & CLUBS (6) ---
  {
    name: 'Neon DJ Nightclub & Lasers',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    category: 'Nightlife'
  },
  {
    name: 'VIP Velvet Lounge & Cocktails',
    url: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=1200&q=80',
    category: 'Nightlife'
  },
  {
    name: 'Rooftop Sunset Skyline Party',
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    category: 'Nightlife'
  },
  {
    name: 'Sunset Yacht Party Cruise',
    url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1200&q=80',
    category: 'Nightlife'
  },
  {
    name: 'Underground Warehouse Rave',
    url: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=1200&q=80',
    category: 'Nightlife'
  },
  {
    name: 'Tropical Beachfront Bonfire Night',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    category: 'Nightlife'
  },

  // --- ARTS, CULTURE & FASHION (6) ---
  {
    name: 'Modern Art Gallery Vernissage',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    category: 'Arts'
  },
  {
    name: 'High Fashion Runway Showcase',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    category: 'Arts'
  },
  {
    name: 'Sculpture Museum Gala Night',
    url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80',
    category: 'Arts'
  },
  {
    name: 'Dramatic Theatre & Broadway Play',
    url: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1200&q=80',
    category: 'Arts'
  },
  {
    name: 'Red Carpet Film Premiere',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    category: 'Arts'
  },
  {
    name: 'Visual Photography Exhibition',
    url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
    category: 'Arts'
  },

  // --- FOOD & DRINKS (6) ---
  {
    name: 'Sommelier Wine Tasting Dinner',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    category: 'Food & Drinks'
  },
  {
    name: 'Street Food & Night Bazaar',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    category: 'Food & Drinks'
  },
  {
    name: 'Craft Beer Brewery & Hop Fest',
    url: 'https://images.unsplash.com/photo-1538488881522-4326c36057ce?auto=format&fit=crop&w=1200&q=80',
    category: 'Food & Drinks'
  },
  {
    name: 'Mixology & Artisanal Cocktails',
    url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
    category: 'Food & Drinks'
  },
  {
    name: 'Specialty Coffee & Barista Expo',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    category: 'Food & Drinks'
  },
  {
    name: 'Gourmet Barbecue Cookout Championship',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
    category: 'Food & Drinks'
  },

  // --- SPORTS & FITNESS (6) ---
  {
    name: 'International City Marathon',
    url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
    category: 'Sports'
  },
  {
    name: 'Esports Championship Arena',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    category: 'Sports'
  },
  {
    name: 'Football Stadium Derby Classic',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    category: 'Sports'
  },
  {
    name: 'Sunrise Yoga & Mindful Sanctuary',
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    category: 'Sports'
  },
  {
    name: 'Championship Boxing & Fight Night',
    url: 'https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&w=1200&q=80',
    category: 'Sports'
  },
  {
    name: 'PGA Golf Invitational Tournament',
    url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
    category: 'Sports'
  },

  // --- COMMUNITY & WORKSHOPS (4) ---
  {
    name: 'Philanthropy & Black-Tie Charity Gala',
    url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
    category: 'Community'
  },
  {
    name: 'Creative Workshop & Co-Creation',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    category: 'Community'
  },
  {
    name: 'Global Climate & Sustainability Forum',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    category: 'Community'
  },
  {
    name: 'Inspirational Keynotes & TED Talks',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    category: 'Community'
  }
];

const CATEGORIES = [
  { value: 'Music', label: 'Music & Concerts', icon: Music },
  { value: 'Technology', label: 'Technology & AI', icon: Cpu },
  { value: 'Conferences', label: 'Summits & Conferences', icon: Briefcase },
  { value: 'Nightlife', label: 'Nightlife & Clubs', icon: Wine },
  { value: 'Arts', label: 'Arts & Culture', icon: Palette },
  { value: 'Food & Drinks', label: 'Food & Culinary', icon: Utensils },
  { value: 'Fashion', label: 'Fashion & Runway', icon: Sparkles },
];

const ARENA_PRESETS = [
  {
    name: 'Eko Convention Centre',
    address: 'Plot 1415 Adetokunbo Ademola St, Victoria Island',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    lat: '6.4253',
    lng: '3.4219',
    pinLabel: 'Grand Ballroom Main Gate'
  },
  {
    name: 'Landmark Beach & Event Centre',
    address: 'Water Corporation Drive, Victoria Island',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    lat: '6.4239',
    lng: '3.4542',
    pinLabel: 'Beach Gate & Turnstiles'
  },
  {
    name: 'Federal Palace Hotel & Casino',
    address: '6-8 Ahmadu Bello Way, Victoria Island',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    lat: '6.4357',
    lng: '3.4091',
    pinLabel: 'External Lawn & Hall Entrance'
  },
  {
    name: 'Abuja Int’l Conference Centre',
    address: '900 Herbert Macaulay Way, Central Business District',
    city: 'Abuja',
    state: 'FCT',
    country: 'Nigeria',
    lat: '9.0579',
    lng: '7.4951',
    pinLabel: 'Main Foyer & Executive Entrance'
  },
  {
    name: 'Teslim Balogun Stadium',
    address: 'Alhaji Masha Road, Surulere',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    lat: '6.4975',
    lng: '3.3592',
    pinLabel: 'VIP Gate 1 & Pitch Access'
  },
  {
    name: 'Muson Centre',
    address: '8/9 Marina Road, Onikan, Lagos Island',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    lat: '6.4468',
    lng: '3.4026',
    pinLabel: 'Shell Nigeria Hall Entrance'
  }
];

export const CreateEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { organizer } = useAuth();

  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);

  useEffect(() => {
    if (!perms.canCreateEvents) {
      navigate('/organizer', { replace: true });
    }
  }, [perms.canCreateEvents, navigate]);

  const [step, setStep] = useState(1);
  const [createdEventId, setCreatedEventId] = useState<string | null>(id || null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);

  // When step changes, instantly reset scroll to the very top so it feels like a fresh page
  useEffect(() => {
    // 1. Immediate instant reset
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 2. Fallback check for any scrollable parent container in dashboard layout
    const mainScrollParent = document.querySelector('main') || document.documentElement;
    if (mainScrollParent) {
      mainScrollParent.scrollTop = 0;
    }

    // 3. Smooth anchor onto the stepper / header
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (formTopRef.current) {
        formTopRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    });
  }, [step]);

  // Form states
  // Step 1: Basic Info & Branding
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');


  // Step 2: Location
  const [locationType, setLocationType] = useState<'physical' | 'online'>('physical');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [countriesList, setCountriesList] = useState<Country[]>(DEFAULT_COUNTRIES);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

  const selectedCountryCode = useMemo(() => {
    const found = countriesList.find(
      (c) => c.name.toLowerCase() === country.toLowerCase() || c.code.toLowerCase() === country.toLowerCase()
    );
    return found ? found.code : 'NG';
  }, [countriesList, country]);
  const [streamingUrl, setStreamingUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [pinLabel, setPinLabel] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Step 3: Schedule
  const [scheduleType, setScheduleType] = useState<'single' | 'recurring'>('single');
  const [scheduleTimezone, setScheduleTimezone] = useState('Africa/Lagos');
  const [eventFrequency, setEventFrequency] = useState('weekly');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('17:00');
  const [recurringEndType, setRecurringEndType] = useState('after_occurrences');
  const [recurringOccurrences, setRecurringOccurrences] = useState<number>(4);

  const [schedules, setSchedules] = useState<ScheduleSession[]>([]);

  const [lineup, setLineup] = useState<LineupMember[]>([]);

  const [openAvatarPickerIdx, setOpenAvatarPickerIdx] = useState<number | null>(null);
  const [showUrlInputIdx, setShowUrlInputIdx] = useState<number | null>(null);

  const [uploadingAvatarIdx, setUploadingAvatarIdx] = useState<number | null>(null);

  const handleLineupAvatarUpload = async (memberIndex: number, file: File) => {
    setUploadingAvatarIdx(memberIndex);
    try {
      const data = await uploadApi.uploadImage(file, 'avatar');
      handleLineupChange(memberIndex, 'avatarUrl', data.url);
      showNotification('Speaker avatar uploaded successfully!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to upload avatar photo.', 'error');
    } finally {
      setUploadingAvatarIdx(null);
    }
  };

  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  // Event status message state
  const [statusMessageType, setStatusMessageType] = useState<'none' | 'pre_sale' | 'post_sales'>('none');
  const [preSaleMessage, setPreSaleMessage] = useState('');
  const [postSaleMessage, setPostSaleMessage] = useState('');



  // Step 4: Lineup & Speakers


  // Schedules sessions handlers
  const handleAddSchedule = () => {
    const nextDayNum = schedules.length + 1;
    setSchedules((prev) => [
      ...prev,
      {
        day: `Day ${nextDayNum > 2 ? nextDayNum : 1}`,
        title: 'New Technical Session',
        description: 'Session description and key takeaways for attendees.',
        startTime: '14:00',
        endTime: '16:00'
      }
    ]);
  };

  const handleRemoveSchedule = (index: number) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index: number, field: keyof ScheduleSession, value: string) => {
    setSchedules((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Lineup members handlers
  const handleAddLineupMember = () => {
    setLineup((prev) => [
      ...prev,
      {
        name: 'New Featured Speaker',
        role: 'Keynote Speaker',
        bio: 'Industry expert and conference presenter.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        links: [{ platform: 'linkedin', url: 'https://linkedin.com' }]
      }
    ]);
  };

  const handleRemoveLineupMember = (index: number) => {
    setLineup((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLineupChange = (index: number, field: keyof LineupMember, value: any) => {
    setLineup((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddLineupLink = (memberIndex: number, platform = 'website', url = 'https://') => {
    setLineup((prev) => {
      const copy = [...prev];
      const member = copy[memberIndex];
      member.links = [...(member.links || []), { platform: (platform as any) || 'website', url: url || '' }];
      return copy;
    });
  };

  const handleRemoveLineupLink = (memberIndex: number, linkIndex: number) => {
    setLineup((prev) => {
      const copy = [...prev];
      const member = copy[memberIndex];
      member.links = (member.links || []).filter((_, i) => i !== linkIndex);
      return copy;
    });
  };

  const handleLocateAddressOnMap = async () => {
    const searchTarget = [venue, address, streetAddress, city, state, country].filter(Boolean).join(', ');
    if (!searchTarget) {
      showNotification('Please enter a venue or street address first to locate on map.', 'error');
      return;
    }
    setIsGeocodingAddress(true);
    try {
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: searchTarget }, (results, status) => {
          setIsGeocodingAddress(false);
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            const newLat = loc.lat().toFixed(6);
            const newLng = loc.lng().toFixed(6);
            setLatitude(newLat);
            setLongitude(newLng);
            showNotification(`📍 Pinned on map: ${venue || address} (${newLat}°, ${newLng}°)`, 'success');
          } else {
            showNotification('Could not pinpoint that exact address. Try clicking directly on the map.', 'info');
          }
        });
      } else {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTarget)}`);
        const data = await res.json();
        setIsGeocodingAddress(false);
        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat).toFixed(6);
          const newLng = parseFloat(data[0].lon).toFixed(6);
          setLatitude(newLat);
          setLongitude(newLng);
          showNotification(`📍 Pinned on map: ${venue || address}`, 'success');
        } else {
          showNotification('Address not found. Please drop pin on the map.', 'info');
        }
      }
    } catch {
      setIsGeocodingAddress(false);
      showNotification('Geocoding error. Please drop pin on the map.', 'error');
    }
  };

  const handleSelectArenaPreset = (preset: typeof ARENA_PRESETS[0]) => {
    setVenue(preset.name);
    setAddress(preset.address);
    setCity(preset.city);
    setState(preset.state);
    setCountry(preset.country);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setPinLabel(preset.pinLabel);
    showNotification(`Dropped pin for ${preset.name} (${preset.lat}, ${preset.lng})!`, 'success');
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setVenue('');
    setAddress('');
    setStreetAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setPinLabel('Main Entrance');

    const COUNTRY_CENTERS: Record<string, { lat: string; lng: string }> = {
      nigeria: { lat: '6.4281', lng: '3.4244' },
      ghana: { lat: '5.6037', lng: '-0.1870' },
      kenya: { lat: '-1.2921', lng: '36.8219' },
      'south africa': { lat: '-26.2041', lng: '28.0473' },
      rwanda: { lat: '-1.9441', lng: '30.0619' },
      uganda: { lat: '0.3476', lng: '32.5825' },
      tanzania: { lat: '-6.7924', lng: '39.2083' },
      'united kingdom': { lat: '51.5074', lng: '-0.1278' },
      'united states': { lat: '40.7128', lng: '-74.0060' },
      canada: { lat: '43.6532', lng: '-79.3832' },
      'united arab emirates': { lat: '25.2048', lng: '55.2708' },
      germany: { lat: '52.5200', lng: '13.4050' },
      france: { lat: '48.8566', lng: '2.3522' },
      australia: { lat: '-33.8688', lng: '151.2093' },
    };

    const clean = newCountry.trim().toLowerCase();
    const center = COUNTRY_CENTERS[clean];
    if (center) {
      setLatitude(center.lat);
      setLongitude(center.lng);
    }
  };

  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        setLatitude(lat);
        setLongitude(lng);
        setPinLabel('Detected GPS Venue Point');
        setIsLocating(false);
        showNotification(`Pin marked to device GPS coordinates: ${lat}, ${lng}!`, 'success');
      },
      () => {
        setIsLocating(false);
        showNotification('Unable to acquire GPS location. Please check browser permissions or enter coordinates manually.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${latitude}, ${longitude}`);
    setCopiedCoords(true);
    showNotification('GPS Coordinates copied to clipboard!', 'success');
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const mapMarkerQuery = useMemo(() => {
    if (latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
      return `${latitude},${longitude}`;
    }
    return encodeURIComponent(`${venue || 'Lagos'} ${address || ''} ${city}`);
  }, [latitude, longitude, venue, address, city]);

  const previewMapEmbedUrl = `https://maps.google.com/maps?q=${mapMarkerQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const previewDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapMarkerQuery}`;




  // Step 5: Appearance & Branding

  const [eventFormat, setEventFormat] = useState('Conference');
  const [eventCategories, setEventCategories] = useState<string[]>([]);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const category = useMemo(() => eventCategories[0] || 'General', [eventCategories]);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  const [imageUrl, setImageUrl] = useState('');
  const [bannerStyle, setBannerStyle] = useState<HeroBannerStyle>('cinematic');
  const [coverMode, setCoverMode] = useState<'upload' | 'preset' | 'url'>('preset');
  const [coverFileName, setCoverFileName] = useState<string>('');
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [presetCategoryFilter, setPresetCategoryFilter] = useState('All');
  const [presetSearchQuery, setPresetSearchQuery] = useState('');
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const filteredPresets = useMemo(() => {
    return PRESET_COVERS.filter((p) => {
      const matchesCat = presetCategoryFilter === 'All' || p.category === presetCategoryFilter;
      const matchesQuery =
        !presetSearchQuery.trim() ||
        p.name.toLowerCase().includes(presetSearchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(presetSearchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [presetCategoryFilter, presetSearchQuery]);

  const [coverUploadProgress, setCoverUploadProgress] = useState<number | null>(null);

  const handleCoverFileProcess = async (file: File) => {
    setIsUploadingCover(true);
    setCoverUploadProgress(5);
    try {
      const data = await uploadApi.uploadImage(file, 'event_banner', (pct) => {
        setCoverUploadProgress(pct);
      });
      setImageUrl(data.url);
      setCoverFileName(file.name);
      showNotification('Cover flyer uploaded and processed successfully!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to upload cover flyer.', 'error');
    } finally {
      setIsUploadingCover(false);
      setCoverUploadProgress(null);
    }
  };

  const isDescriptionFilled = useMemo(() => {
    if (!description) return false;
    const stripped = description.replace(/<[^>]*>/g, '').trim();
    const hasImg = description.includes('<img');
    return stripped.length > 0 || hasImg;
  }, [description]);

  const isStep1Complete = Boolean(title.trim().length > 0 && isDescriptionFilled);

  const handleToggleCategory = (cat: string) => {
    setEventCategories((prev) => {
      if (prev.includes(cat)) {
        return prev.length > 1 ? prev.filter((c) => c !== cat) : prev;
      } else {
        if (prev.length >= 5) {
          showNotification('You can select a maximum of 5 categories.', 'warning');
          return prev;
        }
        return [...prev, cat];
      }
    });
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (!trimmed) return;
    if (eventCategories.includes(trimmed)) {
      setCustomCategoryInput('');
      return;
    }
    if (eventCategories.length >= 5) {
      showNotification('You can select a maximum of 5 categories.', 'warning');
      return;
    }
    setEventCategories((prev) => [...prev, trimmed]);
    setCustomCategoryInput('');
  };

  const handleRemoveCategory = (cat: string) => {
    setEventCategories((prev) => {
      return prev.length > 1 ? prev.filter((c) => c !== cat) : prev;
    });
  };






  // Load existing event if editing
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    eventApi.getOrganizerEventById(id, organizer?.id)
      .then((res) => {
        const raw = (res.data as any)?.data || res.data;
        if (raw) {
          setTitle(raw.title || '');
          setDescription(raw.description || '');
          if (raw.eventFormat) setEventFormat(extractNameOrString(raw.eventFormat) || 'Conference');
          if (Array.isArray(raw.eventCategory) && raw.eventCategory.length > 0) {
            setEventCategories(raw.eventCategory.map(extractNameOrString).filter(Boolean));
          } else if (raw.category) {
            setEventCategories([extractNameOrString(raw.category)].filter(Boolean));
          }
          setImageUrl(raw.imageUrl || raw.bannerUrl || PRESET_COVERS[0].url);
          const sched = raw.schedule || {};
          const loc = raw.location || {};
          setStartDate(sched.startDate || sched.start_date || raw.startDate || '');
          setStartTime((sched.startTime || sched.start_time || raw.startTime || '18:00').slice(0, 5));
          setEndDate(sched.endDate || sched.end_date || raw.endDate || '');
          setEndTime((sched.endTime || sched.end_time || raw.endTime || '23:30').slice(0, 5));
          setLocationType(raw.locationType === 'online' || raw.eventType === 'virtual' || loc.onlineMeetingUrl ? 'online' : 'physical');
          setVenue(loc.venueName || loc.venue_name || raw.venueName || raw.venue || '');
          setAddress(loc.venueAddress || loc.venue_address || raw.venueAddress || raw.address || '');
          if (loc.streetAddress || raw.streetAddress) setStreetAddress(loc.streetAddress || raw.streetAddress);
          setCity(loc.city || raw.city || 'Lagos');
          if (loc.state || raw.state) setState(loc.state || raw.state);
          if (loc.zip || raw.zip || raw.zipCode || (raw as any).postalCode) {
            setZipCode(loc.zip || raw.zip || raw.zipCode || (raw as any).postalCode);
          }
          if (loc.landmark || raw.landmark) setLandmark(loc.landmark || raw.landmark);
          if (raw.eventCountry || raw.country) setCountry(raw.eventCountry || raw.country);
          if (loc.latitude || raw.latitude) setLatitude(String(loc.latitude || raw.latitude));
          if (loc.longitude || raw.longitude) setLongitude(String(loc.longitude || raw.longitude));
          if (raw.mapMarkerTitle) setPinLabel(raw.mapMarkerTitle);
          setStreamingUrl(loc.onlineMeetingUrl || raw.streamingUrl || '');
          if (sched.type || sched.schedule_type || raw.scheduleType) setScheduleType(sched.type || sched.schedule_type || raw.scheduleType);
          if (sched.timezone || sched.schedule_timezone || raw.scheduleTimezone) setScheduleTimezone(sched.timezone || sched.schedule_timezone || raw.scheduleTimezone);
          if (sched.eventFrequency || sched.event_frequency || raw.eventFrequency) setEventFrequency(sched.eventFrequency || sched.event_frequency || raw.eventFrequency);
          if (sched.recurringEndType || sched.recurring_type || raw.recurringEndType) setRecurringEndType(sched.recurringEndType || sched.recurring_type || raw.recurringEndType);
          if (sched.recurringOccurrences || raw.recurringOccurrences) setRecurringOccurrences(Number(sched.recurringOccurrences || raw.recurringOccurrences));
          const loadedSchedules = Array.isArray(raw.schedules) && raw.schedules.length > 0 ? raw.schedules : (Array.isArray(raw.scheduleItems) ? raw.scheduleItems : []);
          if (loadedSchedules.length > 0) {
            setSchedules(loadedSchedules);
          }
          if (Array.isArray(raw.lineup) && raw.lineup.length > 0) {
            setLineup(raw.lineup);
          }
          if (raw.visibility) setVisibility(raw.visibility);
          if (raw.isFeatured !== undefined) setIsFeatured(Boolean(raw.isFeatured));
          if (raw.id || raw.uuid) setCreatedEventId(String(raw.id || raw.uuid));

          const rawSettings = (raw as any).settings || (raw as any).setting || {};
          const m = (raw as any).meta || {};
          const resolvedStatusMessageType = rawSettings.statusMessageType || rawSettings.status_message_type || (raw as any).statusMessageType || (raw as any).status_message_type || m.statusMessageType;
          const resolvedIsStatusMsgEnabled = rawSettings.isStatusMsgEnabled ?? rawSettings.is_status_msg_enabled ?? (raw as any).isStatusMsgEnabled ?? m.isStatusMsgEnabled;
          const resolvedStatusMessage = rawSettings.statusMessage || rawSettings.status_message || (raw as any).statusMessage || m.statusMessage;
          const resolvedPreSaleMsg = rawSettings.preSaleMessage || rawSettings.pre_sale_message || (raw as any).preSaleMessage || m.preSaleMessage;
          const resolvedPostSaleMsg = rawSettings.postSaleMessage || rawSettings.post_sale_message || (raw as any).postSaleMessage || m.postSaleMessage;
          const resolvedBannerStyle = rawSettings.bannerStyle || rawSettings.banner_style || (raw as any).bannerStyle || m.bannerStyle;

          if (resolvedStatusMessageType === 'pre_sale' || resolvedStatusMessageType === 'post_sales' || resolvedStatusMessageType === 'none') {
            setStatusMessageType(resolvedStatusMessageType);
          } else if (resolvedIsStatusMsgEnabled) {
            setStatusMessageType((resolvedStatusMessage && (resolvedStatusMessage.toLowerCase().includes('ended') || resolvedStatusMessage.toLowerCase().includes('sold out'))) ? 'post_sales' : 'pre_sale');
          }
          if (resolvedPreSaleMsg) setPreSaleMessage(resolvedPreSaleMsg);
          if (resolvedPostSaleMsg) setPostSaleMessage(resolvedPostSaleMsg);
          if (resolvedBannerStyle) setBannerStyle(resolvedBannerStyle);
        }
      })
      .catch(() => {
        showNotification('Unable to fetch event for editing.', 'error');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, organizer?.id]);

  // Load supported countries from backend
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCountries(true);
    countriesApi.getCountries()
      .then((data) => {
        if (isMounted && data.length > 0) {
          setCountriesList(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load countries from backend, using fallback list:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCountries(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-generate slug
  const slug = useMemo(() => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'your-event-slug';
  }, [title]);

  // Readiness Score
  const readinessChecklist = useMemo(() => {
    return [
      { label: 'Event Name & Story', done: Boolean(title.trim().length >= 4 && isDescriptionFilled) },
      { label: 'Format & Categories', done: Boolean(eventCategories.length > 0) },
      { label: 'Location Configured', done: Boolean(locationType === 'online' ? streamingUrl.trim() : venue.trim()) },
      { label: 'Schedule Confirmed', done: Boolean(startDate) },
      { label: 'Cover Banner Set', done: Boolean(imageUrl) },
    ];
  }, [title, isDescriptionFilled, eventCategories, locationType, streamingUrl, venue, startDate, imageUrl]);

  const readinessPercentage = useMemo(() => {
    const doneCount = readinessChecklist.filter(c => c.done).length;
    return Math.round((doneCount / readinessChecklist.length) * 100);
  }, [readinessChecklist]);

  const handleCopySlug = () => {
    navigator.clipboard.writeText(`https://eventa.live/events/${slug}`);
    setCopiedSlug(true);
    showNotification('Event link copied to clipboard!', 'success');
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  // Quick Date presets
  const applyDatePreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const iso = d.toISOString().split('T')[0];
    setStartDate(iso);
    setEndDate(iso);
  };

  const formatTimeToHi = (timeStr?: string, defaultTime: string = '09:00'): string => {
    if (!timeStr) return defaultTime;
    const trimmed = timeStr.trim();
    const parts = trimmed.split(':');
    if (parts.length >= 2) {
      const hours = parts[0].padStart(2, '0').slice(-2);
      const minutes = parts[1].padStart(2, '0').slice(0, 2);
      return `${hours}:${minutes}`;
    }
    return defaultTime;
  };

  // Build EXACT backend event creation payload
  const buildEventPayload = (statusOverride?: 'draft' | 'published') => {
    const cleanTimezone = scheduleTimezone.includes('(')
      ? scheduleTimezone.split('(')[0].trim()
      : scheduleTimezone.trim();

    return {
      title: title.trim(),
      description: description.trim(),
      eventCountry: country || 'Nigeria',
      eventType: (locationType === 'online' ? 'virtual' : 'physical') as 'physical' | 'virtual',
      eventFormat,
      eventCategory: (eventCategories.length > 0 ? eventCategories : ['Technology']).slice(0, 5),
      venueName: locationType === 'physical' ? venue.trim() : undefined,
      venueAddress: locationType === 'physical' ? address.trim() : undefined,
      streetAddress: locationType === 'physical' ? streetAddress.trim() : undefined,
      city: locationType === 'physical' ? city.trim() : undefined,
      state: locationType === 'physical' ? state.trim() : undefined,
      zip: locationType === 'physical' ? zipCode.trim() : undefined,
      landmark: locationType === 'physical' ? landmark.trim() : undefined,
      longitude: locationType === 'physical' && longitude ? Number(Number(longitude).toFixed(4)) : undefined,
      latitude: locationType === 'physical' && latitude ? Number(Number(latitude).toFixed(4)) : undefined,
      onlineMeetingUrl: locationType === 'online' ? streamingUrl.trim() : undefined,
      scheduleType,
      scheduleTimezone: cleanTimezone || 'Africa/Lagos',
      eventFrequency: scheduleType === 'recurring' ? eventFrequency : undefined,
      startDate,
      startTime: formatTimeToHi(startTime, '09:00'),
      endDate: endDate || startDate,
      endTime: formatTimeToHi(endTime, '17:00'),
      recurringEndType: scheduleType === 'recurring' ? recurringEndType : undefined,
      recurringOccurrences: scheduleType === 'recurring' ? Number(recurringOccurrences) || 1 : undefined,
      schedules: schedules.map((s) => ({
        ...s,
        startTime: formatTimeToHi(s.startTime, '09:00'),
        endTime: formatTimeToHi(s.endTime, '11:00')
      })),
      lineup,
      status: statusOverride || 'draft',
      visibility,
      bannerUrl: imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      isFeatured,
      settings: {
        banner_style: bannerStyle,
        bannerStyle,
        status_message_type: statusMessageType,
        statusMessageType,
        status_message: statusMessageType === 'pre_sale' ? preSaleMessage : (statusMessageType === 'post_sales' ? postSaleMessage : ''),
        statusMessage: statusMessageType === 'pre_sale' ? preSaleMessage : (statusMessageType === 'post_sales' ? postSaleMessage : ''),
        pre_sale_message: preSaleMessage,
        preSaleMessage,
        post_sale_message: postSaleMessage,
        postSaleMessage,
        is_status_msg_enabled: statusMessageType !== 'none',
        isStatusMsgEnabled: statusMessageType !== 'none',
      },
      banner_style: bannerStyle,
      bannerStyle,
      status_message_type: statusMessageType,
      statusMessageType,
      status_message: statusMessageType === 'pre_sale' ? preSaleMessage : (statusMessageType === 'post_sales' ? postSaleMessage : ''),
      statusMessage: statusMessageType === 'pre_sale' ? preSaleMessage : (statusMessageType === 'post_sales' ? postSaleMessage : ''),
      pre_sale_message: preSaleMessage,
      preSaleMessage,
      post_sale_message: postSaleMessage,
      postSaleMessage,
      is_status_msg_enabled: statusMessageType !== 'none',
      isStatusMsgEnabled: statusMessageType !== 'none',
      meta: {
        bannerStyle,
        statusMessageType,
        statusMessage: statusMessageType === 'pre_sale' ? preSaleMessage : (statusMessageType === 'post_sales' ? postSaleMessage : ''),
        preSaleMessage,
        postSaleMessage,
        isStatusMsgEnabled: statusMessageType !== 'none',
      }
    };
  };

  const isStepAccessible = (targetId: number) => {
    if (targetId === 1) return true;
    if (targetId >= 2 && !isStep1Complete) return false;
    if (
      targetId >= 3 &&
      ((locationType === 'physical' && !venue.trim()) ||
        (locationType === 'online' && !streamingUrl.trim()))
    )
      return false;
    if (targetId >= 4 && !startDate) return false;
    return true;
  };

  const handleStepClick = (targetId: number) => {
    if (targetId === step) return;
    if (targetId >= 2 && !isStep1Complete) {
      if (!title.trim()) {
        showNotification('Please enter an Event Name before proceeding.', 'warning');
      } else if (!isDescriptionFilled) {
        showNotification('Please provide an Experience Story & Description before proceeding.', 'warning');
      }
      return;
    }
    if (
      targetId >= 3 &&
      ((locationType === 'physical' && !venue.trim()) ||
        (locationType === 'online' && !streamingUrl.trim()))
    ) {
      showNotification('Please specify the Event Location before proceeding to Schedule.', 'warning');
      return;
    }
    if (targetId >= 4 && !startDate) {
      showNotification('Please select an Event Date in Schedule before proceeding.', 'warning');
      return;
    }
    setStep(targetId);
  };

  const handleProceedNext = () => {
    if (step === 1) {
      if (!title.trim()) {
        showNotification('Please enter an Event Name before proceeding to Location.', 'warning');
        return;
      }
      if (!isDescriptionFilled) {
        showNotification('Please provide an Experience Story & Description before proceeding to Location.', 'warning');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (locationType === 'physical' && !venue.trim()) {
        showNotification('Please specify the physical venue name before proceeding to Schedule.', 'warning');
        return;
      }
      if (locationType === 'online' && !streamingUrl.trim()) {
        showNotification('Please specify the streaming link before proceeding to Schedule.', 'warning');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!startDate) {
        showNotification('Please select an Event Date before proceeding to Lineup & Speakers.', 'warning');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handlePublish = async (targetStatus: 'Draft' | 'Published') => {
    if (!title.trim()) {
      showNotification('Please enter an event title in Step 1.', 'warning');
      setStep(1);
      return;
    }
    if (locationType === 'physical' && !venue.trim()) {
      showNotification('Please specify the physical venue name in Step 2.', 'warning');
      setStep(2);
      return;
    }
    if (locationType === 'online' && !streamingUrl.trim()) {
      showNotification('Please specify the streaming link in Step 2.', 'warning');
      setStep(2);
      return;
    }
    if (!startDate) {
      showNotification('Please pick an event date in Step 3.', 'warning');
      setStep(3);
      return;
    }

    setIsLoading(true);
    try {
      const payload = buildEventPayload(targetStatus.toLowerCase() as 'draft' | 'published');
      const targetId = createdEventId || (isEditing && id ? id : null);
      let eventId = targetId;

      if (targetId) {
        await eventApi.updateEvent(targetId, payload, organizer?.id);
        showNotification(`Event "${title}" successfully saved as ${targetStatus}!`, 'success');
      } else {
        const res = await eventApi.createEvent(payload, organizer?.id);
        const newEvent = (res as any)?.data?.data || (res as any)?.data || res;
        const newId = newEvent?.id || newEvent?.uuid;
        if (newId) {
          eventId = String(newId);
          setCreatedEventId(String(newId));
        }
        showNotification(`🎉 Event "${title}" created successfully as ${targetStatus}!`, 'success');
      }

      if (eventId) {
        navigate(`/organizer/events/${eventId}`);
      } else {
        navigate('/organizer/events');
      }
    } catch (err: any) {
      console.error('Save event error:', err);
      const apiMsg = getApiErrorMessage(err, 'Failed to save event. Please verify required fields.');
      showNotification(apiMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrganizerDashboardLayout>
      <div className="space-y-8 w-full max-w-6xl mx-auto pb-16">

        {/* ========================================================================= */}
        {/* 1. STUDIO HEADER */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
              <Link to="/organizer/events" className="hover:text-zinc-900 transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Events</span>
              </Link>
              <span>/</span>
              <span className="text-zinc-700">{isEditing ? 'Edit Event' : 'Create Event'}</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                {isEditing ? 'Edit Event Studio' : 'Create New Event'}
              </h1>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200/80">
                Step {step} of 5
              </span>
            </div>

            <p className="text-zinc-500 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
              Define the event schedule, pin venue directions, customize attendee branding, and prepare your ticketing launch.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 self-start md:self-center">
            <button
              onClick={() => handlePublish('Draft')}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-800 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Save Draft</span>
            </button>

            {perms.canPublishEvents && (
              <button
                onClick={() => handlePublish('Published')}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-black shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                <span>{isEditing ? 'Update & Publish' : 'Publish Live'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. PROGRESS PIPELINE / STEPPER BAR */}
        {/* ========================================================================= */}
        <div ref={formTopRef} className="scroll-mt-6 bg-white border border-zinc-200/80 rounded-2xl p-2.5 shadow-xs overflow-x-auto scrollbar-none">
          <div className="flex items-center min-w-[700px] justify-between gap-1.5">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isDone = step > s.id;
              const isCurrent = step === s.id;

              return (
                <React.Fragment key={s.id}>
                  <button
                    type="button"
                    onClick={() => handleStepClick(s.id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left flex-1 ${isCurrent
                      ? 'bg-zinc-950 text-white shadow-sm cursor-default ring-1 ring-zinc-950'
                      : isDone
                        ? 'bg-zinc-50 hover:bg-zinc-100/90 text-zinc-900 border border-zinc-200/70 cursor-pointer'
                        : isStepAccessible(s.id)
                          ? 'text-zinc-600 hover:bg-zinc-50 border border-transparent cursor-pointer'
                          : 'text-zinc-400 opacity-45 cursor-not-allowed border border-transparent'
                      }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 transition-colors ${isCurrent
                      ? 'bg-[#E31B23] text-white shadow-xs'
                      : isDone
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-zinc-100 text-zinc-400'
                      }`}>
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isCurrent ? 'text-zinc-400' : isDone ? 'text-emerald-600' : 'text-zinc-400'}`}>
                          0{s.id}
                        </span>
                        <span className="text-xs font-black block leading-none truncate">{s.label}</span>
                      </div>
                      <span className={`text-[11px] font-medium block mt-1 truncate ${isCurrent ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {s.subtitle}
                      </span>
                    </div>
                  </button>

                  {idx < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-zinc-300 flex-shrink-0 mx-0.5" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. STEPPER FORM PANELS */}
        {/* ========================================================================= */}
        <div className="max-w-5xl mx-auto w-full space-y-6">

          <div
            key={step}
            className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-9 md:p-10 shadow-xs space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >

              {/* STEP 1: ESSENTIALS */}
              {step === 1 && (
                <div className="space-y-7">
                  <div className="border-b border-zinc-100 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#E31B23]">Phase 01</span>
                    <h3 className="text-xl font-black text-zinc-950 tracking-tight mt-0.5">
                      Event Essentials & Details
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 font-medium">
                      Provide the core identity, discovery keywords, format, and description for your event.
                    </p>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <span>Event Name</span>
                        <span className="text-[#E31B23] font-bold">*</span>
                      </label>
                      <span className="text-[11px] text-zinc-400 font-mono font-medium">{title.length}/100</span>
                    </div>
                    <input
                      type="text"
                      maxLength={100}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Lagos Tech Fest 2026, Afro Nation, AI DevCon..."
                      className="w-full px-4 py-3 bg-zinc-50/80 hover:bg-zinc-50 border border-zinc-200 focus:border-[#E31B23] focus:bg-white rounded-2xl text-sm font-bold text-zinc-950 placeholder-zinc-400 outline-none transition-all shadow-2xs focus:ring-3 focus:ring-red-500/10"
                      required
                    />
                  </div>

                  {/* Event Format Selector */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#E31B23]" />
                        <span>Event Format</span>
                        <span className="text-[#E31B23] font-bold">*</span>
                      </label>
                      <span className="text-[11px] font-semibold text-zinc-500">Selected: <strong className="text-zinc-900">{eventFormat}</strong></span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {EVENT_FORMATS.map((fmt) => {
                        const isSelected = eventFormat === fmt;
                        return (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => setEventFormat(fmt)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center truncate ${isSelected
                              ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs ring-1 ring-zinc-950'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300'
                              }`}
                          >
                            {fmt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Categories Multi-Select Chips */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#E31B23]" />
                        <span>Event Categories & Tags *</span>
                      </label>
                      <span className="text-[11px] font-medium text-zinc-500">
                        {eventCategories.length}/5 selected (max 5)
                      </span>
                    </div>

                    {/* Active Selected Category Tags */}
                    <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                      {eventCategories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-300 text-zinc-900 rounded-xl text-xs font-bold shadow-2xs"
                        >
                          <span>{cat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(cat)}
                            className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer p-0.5"
                            title={`Remove ${cat}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}

                      {/* Custom Category Input */}
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="text"
                          value={customCategoryInput}
                          onChange={(e) => setCustomCategoryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomCategory();
                            }
                          }}
                          placeholder="+ Add tag (press Enter)"
                          className="px-2.5 py-1 text-xs font-semibold bg-transparent outline-none placeholder-zinc-400 text-zinc-900 w-36"
                        />
                        {customCategoryInput.trim() && (
                          <button
                            type="button"
                            onClick={handleAddCustomCategory}
                            className="px-2 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold hover:bg-zinc-800 transition-all cursor-pointer"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Popular Tag Suggestions */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                        Suggested Categories:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_CATEGORY_TAGS.map((tag) => {
                          const isAdded = eventCategories.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                if (isAdded) {
                                  handleRemoveCategory(tag);
                                } else {
                                  if (eventCategories.length >= 5) {
                                    showNotification('You can select a maximum of 5 categories.', 'warning');
                                    return;
                                  }
                                  setEventCategories((prev) => [...prev, tag]);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${isAdded
                                ? 'bg-red-50 border-red-200 text-[#E31B23] font-bold'
                                : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                                }`}
                            >
                              {isAdded ? `✓ ${tag}` : `+ ${tag}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Description Rich Text Editor */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-800 block">Description / Experience Story *</label>
                      {!isDescriptionFilled && (
                        <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Required for Location & Schedule
                        </span>
                      )}
                    </div>
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Give attendees a vivid reason to attend. Describe the atmosphere, keynote sessions, performers, and what makes this event unmissable..."
                      minHeight="180px"
                    />
                  </div>

                  {/* Visibility & Spotlight Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-2">
                      <label className="text-xs font-bold text-zinc-800 flex items-center justify-between">
                        <span>Event Visibility</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${visibility === 'public' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'
                          }`}>
                          {visibility}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setVisibility('public')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${visibility === 'public'
                            ? 'bg-white text-zinc-950 border-zinc-900 shadow-2xs ring-1 ring-zinc-900'
                            : 'bg-zinc-100/80 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                            }`}
                        >
                          Public
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisibility('private')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${visibility === 'private'
                            ? 'bg-white text-zinc-950 border-zinc-900 shadow-2xs ring-1 ring-zinc-900'
                            : 'bg-zinc-100/80 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                            }`}
                        >
                          Private
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium">
                        {visibility === 'public'
                          ? 'Listed on Eventa marketplace & indexed on search engines.'
                          : 'Only accessible to users with the direct secret link.'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
                          <span>Marketplace Spotlight</span>
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E31B23]"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                        Highlight in the "Featured & Spotlight" carousel on the Eventa homepage for increased attendee visibility.
                      </p>
                    </div>
                  </div>


                </div>
              )}

              {/* STEP 2: LOCATION */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-zinc-100 pb-4">
                    <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                      Event Location
                    </h3>
                  </div>

                  {/* Physical vs Virtual Segmented Toggle */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLocationType('physical')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${locationType === 'physical'
                        ? 'border-[#E31B23] bg-red-50/50 shadow-xs ring-1 ring-[#E31B23]/30'
                        : 'border-zinc-200 hover:bg-zinc-50'
                        }`}
                    >
                      <MapPin className={`w-5 h-5 mb-2 ${locationType === 'physical' ? 'text-[#E31B23]' : 'text-zinc-400'}`} />
                      <h4 className="text-sm font-black text-zinc-950">In-Person Arena</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Physical event venue, hall, or outdoor festival.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLocationType('online')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${locationType === 'online'
                        ? 'border-[#E31B23] bg-red-50/50 shadow-xs ring-1 ring-[#E31B23]/30'
                        : 'border-zinc-200 hover:bg-zinc-50'
                        }`}
                    >
                      <Radio className={`w-5 h-5 mb-2 ${locationType === 'online' ? 'text-[#E31B23]' : 'text-zinc-400'}`} />
                      <h4 className="text-sm font-black text-zinc-950">Virtual Livestream</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Zoom, YouTube Live, or private streaming webinar.</p>
                    </button>
                  </div>

                  {locationType === 'physical' ? (
                    <div className="space-y-5 pt-2">
                      {/* 1. Country Selection (Top Anchor for Search & Region) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-[#E31B23]" />
                            <span>Event Country *</span>
                          </label>

                        </div>
                        <div className="relative">
                          <select
                            value={country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm font-bold text-zinc-900 focus:border-[#E31B23] focus:bg-white outline-none cursor-pointer appearance-none transition-all shadow-xs"
                          >
                            {countriesList.map((c) => (
                              <option key={c.code} value={c.name}>
                                {c.flag ? `${c.flag} ` : ''}{c.name} ({c.code})
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-500">
                            {isLoadingCountries ? (
                              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 2. Google-Powered Venue & Hall Search (Country-Restricted) */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50/50 via-white to-zinc-50 border border-zinc-200 shadow-xs space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <label className="text-xs font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                            <div className="w-5 h-5 rounded-lg bg-[#E31B23] flex items-center justify-center text-white shadow-xs">
                              <Search className="w-3 h-3" />
                            </div>
                            <span>Search Venue or Event Hall</span>

                          </label>
                          <span className="text-[11px] font-semibold text-[#E31B23]">
                            Only results from {country || 'selected country'}
                          </span>
                        </div>
                        <VenueAutocompleteInput
                          country={country}
                          countryCode={selectedCountryCode}
                          placeholder={`Search venue, hall, hotel, or center in ${country || 'selected country'} (e.g. Crisma Hall)...`}
                          initialValue={venue}
                          onPlaceSelect={(details) => {
                            if (details.venue) setVenue(details.venue);
                            if (details.streetAddress) setAddress(details.streetAddress);
                            if (details.city) setCity(details.city);
                            if (details.state) setState(details.state);
                            if (details.zipCode) setZipCode(details.zipCode);
                            if (details.country) setCountry(details.country);
                            if (details.lat) setLatitude(details.lat);
                            if (details.lng) setLongitude(details.lng);
                            if (details.venue) {
                              setPinLabel(`${details.venue} Entrance`);
                            } else if (details.streetAddress) {
                              setPinLabel(`${details.streetAddress} Gate`);
                            }
                            showNotification(
                              `📍 Selected ${details.venue || details.streetAddress}: address & map pinpointed!`,
                              'success'
                            );
                          }}
                        />
                      </div>

                      {/* Venue Name & Street Address Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-zinc-800">Venue Name / Hall / Area *</label>
                          </div>
                          <input
                            type="text"
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            placeholder="e.g. Eko Convention Centre or Crisma Hall"
                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-bold text-zinc-900 outline-none focus:border-[#E31B23] focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-zinc-800">Street Address</label>
                          </div>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Plot 1415 Adetokunbo Ademola Street"
                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-bold text-zinc-900 outline-none focus:border-[#E31B23] focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* City, State, Zip Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800">City</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Lagos"
                            className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:border-[#E31B23] focus:bg-white outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800">State / Region</label>
                          <input
                            type="text"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="e.g. Lagos State"
                            className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:border-[#E31B23] focus:bg-white outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800">Zip / Postal Code</label>
                          <input
                            type="text"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="e.g. 101241"
                            className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:border-[#E31B23] focus:bg-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-zinc-800">Landmark / Proximity Reference</label>
                          <span className="text-[10px] text-zinc-400 font-medium">e.g. Adjacent to Eko Hotel</span>
                        </div>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="e.g. Adjacent to Eko Hotel or Opposite City Mall"
                          className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-bold text-zinc-900 outline-none focus:border-[#E31B23] focus:bg-white"
                        />
                      </div>

                      {/* Interactive Map Drop Point & Pin Marker Studio */}
                      <div className="pt-4 border-t border-zinc-150 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>

                            <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                              Drop or drag the red pin anywhere on the map to pinpoint your exact gate or entrance.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">

                            <button
                              type="button"
                              onClick={handleDetectCurrentLocation}
                              disabled={isLocating}
                              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 flex-shrink-0"
                            >
                              {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5 text-red-400" />}
                              <span>{isLocating ? 'Detecting GPS...' : 'Use My GPS'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Interactive Google Map Drop Point & Pin Marker */}
                        <MapPinPicker
                          latitude={latitude}
                          longitude={longitude}
                          onChange={(newLat, newLng, details) => {
                            setLatitude(newLat);
                            setLongitude(newLng);
                            if (details) {
                              if (details.streetAddress) {
                                setAddress(details.streetAddress);
                              }
                              if (details.venue) {
                                setVenue(details.venue);
                              }
                              if (details.city) {
                                setCity(details.city);
                              }
                              if (details.state) {
                                setState(details.state);
                              }
                              if (details.zipCode) {
                                setZipCode(details.zipCode);
                              }
                              if (details.country) {
                                setCountry(details.country);
                              }
                              if (details.venue) {
                                setPinLabel(`${details.venue} Entrance`);
                              } else if (details.streetAddress) {
                                setPinLabel(`${details.streetAddress} Gate`);
                              }

                              const venueStr = details.venue ? `${details.venue}` : '';
                              const streetStr = details.streetAddress ? `${details.streetAddress}` : '';
                              const summary = [venueStr, streetStr].filter(Boolean).join(' • ');
                              if (summary) {
                                showNotification(`📍 Location updated: ${summary}`, 'success');
                              }
                            }
                          }}
                          pinLabel={pinLabel}
                          venueName={venue}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-800 flex items-center justify-between">
                          <label className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-[#E31B23]" />
                            <span>Event Country *</span>
                          </label>
                          {isLoadingCountries && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
                        </label>
                        <div className="relative">
                          <select
                            value={country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm font-bold text-zinc-900 focus:border-[#E31B23] focus:bg-white outline-none cursor-pointer appearance-none transition-all shadow-xs"
                          >
                            {countriesList.map((c) => (
                              <option key={c.code} value={c.name}>
                                {c.flag ? `${c.flag} ` : ''}{c.name} ({c.code})
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-500">
                            {isLoadingCountries ? (
                              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-800">Stream or Webinar Access URL *</label>
                        <input
                          type="url"
                          value={streamingUrl}
                          onChange={(e) => setStreamingUrl(e.target.value)}
                          placeholder="https://zoom.us/j/123456789 or YouTube Live URL"
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                        />
                      </div>
                    </div>

                  )}
                </div>
              )}

              {/* STEP 3: SCHEDULE */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-zinc-100 pb-4">
                    <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                      Schedule
                    </h3>
                  </div>

                  {/* 1. Schedule Type: Single vs Recurring */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setScheduleType('single')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${scheduleType === 'single'
                        ? 'border-[#E31B23] bg-red-50/50 shadow-xs ring-1 ring-[#E31B23]/30'
                        : 'border-zinc-200 hover:bg-zinc-50'
                        }`}
                    >
                      <Calendar className={`w-5 h-5 mb-2 ${scheduleType === 'single' ? 'text-[#E31B23]' : 'text-zinc-400'}`} />
                      <h4 className="text-sm font-black text-zinc-950">Single-Day / Standalone</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">One-time event or multi-day convention taking place once.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScheduleType('recurring')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${scheduleType === 'recurring'
                        ? 'border-[#E31B23] bg-red-50/50 shadow-xs ring-1 ring-[#E31B23]/30'
                        : 'border-zinc-200 hover:bg-zinc-50'
                        }`}
                    >
                      <RefreshCw className={`w-5 h-5 mb-2 ${scheduleType === 'recurring' ? 'text-[#E31B23]' : 'text-zinc-400'}`} />
                      <h4 className="text-sm font-black text-zinc-950">Recurring Series</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Repeats weekly, daily, or monthly over scheduled occurrences.</p>
                    </button>
                  </div>

                  {/* Recurring Configuration Fields */}
                  {scheduleType === 'recurring' && (
                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                      <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-2.5">
                        <RefreshCw className="w-4 h-4 text-[#E31B23]" />
                        <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                          Recurring Series Parameters
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800">Frequency</label>
                          <select
                            value={eventFrequency}
                            onChange={(e) => setEventFrequency(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                          >
                            <option value="weekly">Weekly</option>
                            <option value="daily">Daily</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800">End Condition</label>
                          <select
                            value={recurringEndType}
                            onChange={(e) => setRecurringEndType(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                          >
                            <option value="after_occurrences">After set number of occurrences</option>
                            <option value="on_date">On specific end date</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800">Occurrences Count</label>
                          <input
                            type="number"
                            min={1}
                            max={52}
                            value={recurringOccurrences}
                            onChange={(e) => setRecurringOccurrences(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1-Click Quick Presets */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Quick Date Presets</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyDatePreset(3)}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        In 3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDatePreset(7)}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Next Week
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDatePreset(14)}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        In 2 Weeks
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDatePreset(30)}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        In 1 Month
                      </button>
                    </div>
                  </div>

                  {/* Start Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-800">Start Date *</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm font-bold text-zinc-900 outline-none focus:border-[#E31B23] shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-800">Doors Open / Start Time *</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm font-bold text-zinc-900 outline-none focus:border-[#E31B23] shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* End Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-800">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm font-bold text-zinc-900 outline-none focus:border-[#E31B23] shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-800">Conclusion / End Time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm font-bold text-zinc-900 outline-none focus:border-[#E31B23] shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Interactive Schedules / Agenda Studio */}
                  <div className="pt-4 border-t border-zinc-150 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#E31B23]" />
                          <span>Event Agenda & Sessions ({schedules.length})</span>
                        </h4>
                        <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                          Break your event into distinct tracks, keynotes, or workshop segments.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddSchedule}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Session</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {schedules.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200 space-y-3 relative hover:border-zinc-300 transition-colors"
                        >
                          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={item.day || `Day ${idx + 1}`}
                                onChange={(e) => handleScheduleChange(idx, 'day', e.target.value)}
                                placeholder="e.g. Day 1 or Morning Track"
                                className="text-xs font-black text-zinc-900 bg-transparent border-b border-dashed border-zinc-300 focus:border-[#E31B23] outline-none px-1 py-0.5 w-32"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveSchedule(idx)}
                              className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                              title="Delete session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">Start Time</label>
                              <input
                                type="time"
                                value={item.startTime}
                                onChange={(e) => handleScheduleChange(idx, 'startTime', e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">End Time</label>
                              <input
                                type="time"
                                value={item.endTime}
                                onChange={(e) => handleScheduleChange(idx, 'endTime', e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Session Title *</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleScheduleChange(idx, 'title', e.target.value)}
                              placeholder="e.g. Opening Keynote & Architecture Overview"
                              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Description</label>
                            <textarea
                              rows={2}
                              value={item.description || ''}
                              onChange={(e) => handleScheduleChange(idx, 'description', e.target.value)}
                              placeholder="Session details, speaker overview, and expected attendee takeaways..."
                              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-800 outline-none focus:border-[#E31B23]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* STEP 4: LINEUP & SPEAKERS */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-zinc-100 pb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                        Featured Lineup & Speakers
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Spotlight headline speakers, artists, keynote presenters, and panelists.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddLineupMember}
                      className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Speaker</span>
                    </button>
                  </div>

                  {lineup.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-zinc-200 rounded-2xl text-center space-y-2">
                      <Users className="w-8 h-8 text-zinc-300 mx-auto" />
                      <p className="text-xs font-bold text-zinc-600">No speakers or performers added yet</p>
                      <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                        Spotlight keynote presenters to build excitement and boost conversions, or proceed to Appearance if your lineup is to be announced.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddLineupMember}
                        className="mt-2 px-3 py-1.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Speaker</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lineup.map((member, mIdx) => (
                        <div
                          key={mIdx}
                          className="p-5 rounded-2xl bg-zinc-50/70 border border-zinc-200 space-y-3 relative hover:border-zinc-300 transition-colors"
                        >
                          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                                alt={member.name}
                                className="w-9 h-9 rounded-full object-cover border border-zinc-300"
                              />
                              <div>
                                <span className="text-xs font-black text-zinc-900 block">
                                  {member.name || `Speaker #${mIdx + 1}`}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-medium block">
                                  {member.role || 'Guest Speaker'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveLineupMember(mIdx)}
                              className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                              title="Delete lineup member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">Full Name *</label>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => handleLineupChange(mIdx, 'name', e.target.value)}
                                placeholder="e.g. Alex Mercer"
                                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">Role / Title *</label>
                              <input
                                type="text"
                                value={member.role}
                                onChange={(e) => handleLineupChange(mIdx, 'role', e.target.value)}
                                placeholder="e.g. Lead Systems Architect"
                                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                              />
                            </div>
                          </div>

                          {/* Avatar & Photo Section */}
                          <div className="p-3 bg-white rounded-xl border border-zinc-200/80 space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="w-3 h-3 text-[#E31B23]" />
                                <span>Speaker Photo / Avatar</span>
                              </label>
                              {member.avatarUrl && (
                                <button
                                  type="button"
                                  onClick={() => handleLineupChange(mIdx, 'avatarUrl', '')}
                                  className="text-[10px] font-bold text-zinc-400 hover:text-red-600 cursor-pointer transition-colors"
                                >
                                  Clear Photo
                                </button>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <div className="relative group shrink-0">
                                <img
                                  src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                                  alt={member.name || 'Speaker'}
                                  className="w-12 h-12 rounded-xl object-cover border-2 border-zinc-200 shadow-2xs group-hover:border-[#E31B23] transition-colors"
                                />
                                {member.avatarUrl && (
                                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] shadow-xs">
                                    <Check className="w-2.5 h-2.5" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 flex flex-wrap items-center gap-2">
                                {/* Upload Image Button */}
                                <label className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                                  <Upload className="w-3.5 h-3.5 text-[#E31B23]" />
                                  <span>Upload Photo</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleLineupAvatarUpload(mIdx, file);
                                      e.target.value = '';
                                    }}
                                  />
                                </label>

                                {/* Select System Avatar Button */}
                                <button
                                  type="button"
                                  onClick={() => setOpenAvatarPickerIdx(openAvatarPickerIdx === mIdx ? null : mIdx)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                                    openAvatarPickerIdx === mIdx
                                      ? 'bg-[#E31B23] text-white shadow-xs'
                                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 shadow-2xs'
                                  }`}
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                  <span>{openAvatarPickerIdx === mIdx ? 'Close Avatars' : 'Select System Avatar'}</span>
                                </button>

                                {/* Direct URL toggle */}
                                <button
                                  type="button"
                                  onClick={() => setShowUrlInputIdx(showUrlInputIdx === mIdx ? null : mIdx)}
                                  className="px-2 py-1 text-zinc-500 hover:text-zinc-800 text-[11px] font-medium cursor-pointer"
                                >
                                  {showUrlInputIdx === mIdx ? 'Hide URL' : 'Paste URL'}
                                </button>
                              </div>
                            </div>

                            {/* Direct URL Input drawer */}
                            {showUrlInputIdx === mIdx && (
                              <div className="pt-1.5">
                                <input
                                  type="url"
                                  value={member.avatarUrl || ''}
                                  onChange={(e) => handleLineupChange(mIdx, 'avatarUrl', e.target.value)}
                                  placeholder="https://images.unsplash.com/..."
                                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-800 outline-none focus:border-[#E31B23]"
                                />
                              </div>
                            )}

                            {/* System Avatar Selection Grid */}
                            {openAvatarPickerIdx === mIdx && (
                              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-zinc-700">Choose a System Avatar</span>
                                  <span className="text-[10px] text-zinc-400">{SYSTEM_AVATARS.length} presets available</span>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                  {SYSTEM_AVATARS.map((av) => {
                                    const isSelected = member.avatarUrl === av.url;
                                    return (
                                      <button
                                        key={av.id}
                                        type="button"
                                        onClick={() => {
                                          handleLineupChange(mIdx, 'avatarUrl', av.url);
                                          setOpenAvatarPickerIdx(null);
                                        }}
                                        className={`relative group rounded-xl overflow-hidden p-1 border-2 transition-all cursor-pointer aspect-square ${
                                          isSelected ? 'border-[#E31B23] bg-red-50 ring-2 ring-[#E31B23]/30' : 'border-zinc-200 hover:border-zinc-400 bg-white'
                                        }`}
                                        title={av.name}
                                      >
                                        <img
                                          src={av.url}
                                          alt={av.name}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                        {isSelected && (
                                          <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#E31B23] text-white rounded-full flex items-center justify-center text-[8px]">
                                            <Check className="w-2 h-2" />
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Speaker Bio</label>
                            <textarea
                              rows={2}
                              value={member.bio || ''}
                              onChange={(e) => handleLineupChange(mIdx, 'bio', e.target.value)}
                              placeholder="Brief background or credentials..."
                              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-800 outline-none focus:border-[#E31B23]"
                            />
                          </div>

                          {/* Social Links Sub-list */}
                          <div className="space-y-2 pt-1 border-t border-zinc-200/60">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                                Social & Profile Links
                              </label>
                              <button
                                type="button"
                                onClick={() => handleAddLineupLink(mIdx, 'github', 'https://github.com/')}
                                className="text-[10px] font-bold text-[#E31B23] hover:underline cursor-pointer inline-flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Link</span>
                              </button>
                            </div>

                            {(member.links || []).map((link, lIdx) => (
                              <div key={lIdx} className="flex items-center gap-2">
                                <select
                                  value={link.platform}
                                  onChange={(e) => {
                                    const nextLinks = [...(member.links || [])];
                                    nextLinks[lIdx] = { ...nextLinks[lIdx], platform: e.target.value as any };
                                    handleLineupChange(mIdx, 'links', nextLinks);
                                  }}
                                  className="px-2 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 outline-none"
                                >
                                  <option value="github">GitHub</option>
                                  <option value="twitter">Twitter / X</option>
                                  <option value="linkedin">LinkedIn</option>
                                  <option value="website">Website</option>
                                </select>
                                <input
                                  type="url"
                                  value={link.url}
                                  onChange={(e) => {
                                    const nextLinks = [...(member.links || [])];
                                    nextLinks[lIdx] = { ...nextLinks[lIdx], url: e.target.value };
                                    handleLineupChange(mIdx, 'links', nextLinks);
                                  }}
                                  placeholder="https://..."
                                  className="flex-1 px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-mono text-zinc-800 outline-none focus:border-[#E31B23]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLineupLink(mIdx, lIdx)}
                                  className="text-zinc-400 hover:text-red-600 cursor-pointer p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: APPEARANCE & BRANDING */}
              {step === 5 && (
                <div className="space-y-7 animate-in fade-in duration-200">
                  <div className="border-b border-zinc-100 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#E31B23]">Phase 05</span>
                    <h3 className="text-xl font-black text-zinc-950 tracking-tight mt-0.5">
                      Appearance, Flyer & Status
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 font-medium">
                      Upload your high-res event flyer, select presentation theme, and configure pre/post sale messaging.
                    </p>
                  </div>

                  {/* Pre-Ticketing Creation Notice Banner */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex items-start gap-3 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                        Ticketing & Inventory Workflow
                      </h5>
                      <p className="text-xs text-amber-900/90 font-medium leading-relaxed">
                        When you save or publish your event, you will seamlessly land in the <strong>Event Command Hub</strong> where you can configure ticket tiers, VIP pricing, attendee checkout questions, and promo codes.
                      </p>
                    </div>
                  </div>

                  {/* Cover Photo & Event Flyer Studio */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-zinc-900 block">Cover Photo & Event Flyer</label>
                        <span className="text-[11px] text-zinc-400">High-res 16:9 banner displayed across event discovery & passes</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full border border-zinc-200">
                        16:9 Recommended
                      </span>
                    </div>

                    {/* Cover Mode Selector */}
                    <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/60 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setCoverMode('upload')}
                        className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverMode === 'upload'
                          ? 'bg-white text-zinc-950 shadow-2xs font-extrabold'
                          : 'text-zinc-600 hover:text-zinc-950'
                          }`}
                      >
                        <Upload className="w-3.5 h-3.5 text-[#E31B23]" />
                        <span>Upload from Device</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverMode('preset')}
                        className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverMode === 'preset'
                          ? 'bg-white text-zinc-950 shadow-2xs font-extrabold'
                          : 'text-zinc-600 hover:text-zinc-950'
                          }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
                        <span>Curated Presets (50)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverMode('url')}
                        className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverMode === 'url'
                          ? 'bg-white text-zinc-950 shadow-2xs font-extrabold'
                          : 'text-zinc-600 hover:text-zinc-950'
                          }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#E31B23]" />
                        <span>Image Link</span>
                      </button>
                    </div>

                    {/* TAB 1: UPLOAD FROM DEVICE */}
                    {coverMode === 'upload' && (
                      <div className="space-y-2">
                        <input
                          ref={coverFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCoverFileProcess(file);
                          }}
                          className="hidden"
                        />

                        {imageUrl && (coverFileName || imageUrl.startsWith('data:image') || imageUrl.includes('/storage/events/banners/')) ? (
                          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 group shadow-xs">
                            <img src={imageUrl} alt="Uploaded Event Flyer" className="w-full h-44 sm:h-52 object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                              <button
                                type="button"
                                onClick={() => coverFileInputRef.current?.click()}
                                className="px-3.5 py-2 bg-white text-zinc-950 text-xs font-bold rounded-xl shadow-md hover:bg-zinc-100 transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5 text-[#E31B23]" />
                                <span>Replace Flyer</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setImageUrl(PRESET_COVERS[0].url);
                                  setCoverFileName('');
                                  if (coverFileInputRef.current) coverFileInputRef.current.value = '';
                                }}
                                className="px-3.5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-700 transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-white flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Custom Flyer Active {coverFileName ? `• ${coverFileName}` : ''}</span>
                            </div>
                          </div>
                        ) : (
                          <div
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                            onDragLeave={() => setIsDraggingCover(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDraggingCover(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) handleCoverFileProcess(file);
                            }}
                            onClick={() => coverFileInputRef.current?.click()}
                            className={`h-44 sm:h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${isDraggingCover
                              ? 'border-[#E31B23] bg-red-50/40 ring-4 ring-red-100'
                              : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/70 bg-zinc-50/40'
                              }`}
                          >
                            {isUploadingCover ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
                                <span className="text-xs font-bold text-zinc-700">
                                  Sanitizing & uploading flyer... {coverUploadProgress !== null ? `${coverUploadProgress}%` : ''}
                                </span>
                              </div>
                            ) : (
                              <>
                                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                                  <Upload className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-zinc-900">
                                  Click to browse or drag & drop event banner flyer
                                </span>
                                <span className="text-[11px] text-zinc-400 mt-1 max-w-xs">
                                  Supports high-definition JPG, PNG, WEBP up to 10MB. 16:9 aspect ratio looks sharpest.
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: PRESET GALLERY (50 CURATED PRESETS) */}
                    {coverMode === 'preset' && (
                      <div className="space-y-3 bg-zinc-50/60 p-3.5 rounded-2xl border border-zinc-200/80">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-zinc-900">
                              Curated Photography Studio
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 bg-red-100/70 text-[#E31B23] rounded-full border border-red-200">
                              50 High-Res Presets
                            </span>
                          </div>

                          {/* Quick Search */}
                          <div className="relative w-full sm:w-48">
                            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={presetSearchQuery}
                              onChange={(e) => setPresetSearchQuery(e.target.value)}
                              placeholder="Filter presets..."
                              className="w-full pl-8 pr-7 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#E31B23]"
                            />
                            {presetSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setPresetSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                          {PRESET_CATEGORIES.map((cat) => {
                            const isSelected = presetCategoryFilter === cat;
                            const count =
                              cat === 'All'
                                ? PRESET_COVERS.length
                                : PRESET_COVERS.filter((p) => p.category === cat).length;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setPresetCategoryFilter(cat)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${isSelected
                                  ? 'bg-zinc-900 text-white shadow-2xs'
                                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                                  }`}
                              >
                                {cat} ({count})
                              </button>
                            );
                          })}
                        </div>

                        {/* Gallery Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                          {filteredPresets.map((preset, pIdx) => {
                            const isChosen = imageUrl === preset.url;
                            return (
                              <div
                                key={pIdx}
                                onClick={() => {
                                  setImageUrl(preset.url);
                                  showNotification(`Applied "${preset.name}" cover image`, 'success');
                                }}
                                className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isChosen
                                  ? 'border-[#E31B23] ring-2 ring-red-200 shadow-sm'
                                  : 'border-transparent hover:border-zinc-300'
                                  }`}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.name}
                                  className="w-full h-20 sm:h-22 object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 p-1.5 flex flex-col justify-end">
                                  <span className="text-[10px] font-bold text-white leading-tight truncate">
                                    {preset.name}
                                  </span>
                                </div>
                                {isChosen && (
                                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#E31B23] text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* TAB 3: CUSTOM URL */}
                    {coverMode === 'url' && (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#E31B23] focus:bg-white transition-all"
                        />
                        {imageUrl && !imageUrl.startsWith('data:image') && (
                          <div className="relative rounded-xl overflow-hidden border border-zinc-200 h-32 bg-zinc-100">
                            <img src={imageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hero Header Layout Selection */}
                  <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
                    <HeroHeaderPicker
                      value={bannerStyle}
                      onChange={(s) => setBannerStyle(s)}
                      previewImageUrl={imageUrl}
                      eventTitle={title || 'Your Event Title'}
                      eventCategory={eventCategories[0] || 'Technology'}
                      eventDate={`${formatDate(startDate)} • ${startTime}`}
                      eventVenue={locationType === 'physical' ? (venue || 'Venue Location') : 'Virtual / Online Stream'}
                      showLivePreview={true}
                    />
                  </div>

                  {/* Custom URL Slug Preview */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                    <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#E31B23]" />
                      <span>Custom Event URL</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-500 bg-white px-3 py-2 rounded-xl border border-zinc-200 flex-1 truncate">
                        https://eventa.live/events/<span className="text-zinc-950 font-bold">{slug}</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopySlug}
                        className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
                      >
                        {copiedSlug ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSlug ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* EVENT STATUS MESSAGE CARD */}
                  <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-4 shadow-2xs">
                    <div>
                      <h4 className="text-sm font-black text-zinc-950">Event status message</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        You can use this feature to put up your event page before you’re ready to start sales or display a custom message after sales have ended.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                        Choose a message
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* NONE */}
                        <button
                          type="button"
                          onClick={() => setStatusMessageType('none')}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                            statusMessageType === 'none'
                              ? 'border-[#E31B23] bg-red-50/20 ring-2 ring-red-100'
                              : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              statusMessageType === 'none' ? 'bg-red-100 text-[#E31B23]' : 'bg-zinc-200 text-zinc-600'
                            }`}>
                              <MinusCircle className="w-3.5 h-3.5" />
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              statusMessageType === 'none' ? 'border-[#E31B23] bg-[#E31B23]' : 'border-zinc-300 bg-white'
                            }`}>
                              {statusMessageType === 'none' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-900 block">None</span>
                            <span className="text-[10px] text-zinc-500 mt-0.5 block leading-tight">Regular ticket sales active</span>
                          </div>
                        </button>

                        {/* SHOW A PRE SALE MESSAGE */}
                        <button
                          type="button"
                          onClick={() => setStatusMessageType('pre_sale')}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                            statusMessageType === 'pre_sale'
                              ? 'border-[#E31B23] bg-red-50/20 ring-2 ring-red-100'
                              : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              statusMessageType === 'pre_sale' ? 'bg-amber-100 text-amber-600' : 'bg-zinc-200 text-zinc-600'
                            }`}>
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              statusMessageType === 'pre_sale' ? 'border-[#E31B23] bg-[#E31B23]' : 'border-zinc-300 bg-white'
                            }`}>
                              {statusMessageType === 'pre_sale' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-900 block">Show a pre sale message</span>
                            <span className="text-[10px] text-zinc-500 mt-0.5 block leading-tight">Notice before sales start</span>
                          </div>
                        </button>

                        {/* SHOW A POST SALES MESSAGE */}
                        <button
                          type="button"
                          onClick={() => setStatusMessageType('post_sales')}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                            statusMessageType === 'post_sales'
                              ? 'border-[#E31B23] bg-red-50/20 ring-2 ring-red-100'
                              : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              statusMessageType === 'post_sales' ? 'bg-rose-100 text-rose-600' : 'bg-zinc-200 text-zinc-600'
                            }`}>
                              <AlertCircle className="w-3.5 h-3.5" />
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              statusMessageType === 'post_sales' ? 'border-[#E31B23] bg-[#E31B23]' : 'border-zinc-300 bg-white'
                            }`}>
                              {statusMessageType === 'post_sales' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-900 block">Show a post sales message</span>
                            <span className="text-[10px] text-zinc-500 mt-0.5 block leading-tight">Notice after sales close</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Pre-sale Message Input & Live Preview */}
                    {statusMessageType === 'pre_sale' && (
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pre-sale Announcement Message</span>
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Pre-Sale Mode
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={preSaleMessage}
                          onChange={(e) => setPreSaleMessage(e.target.value)}
                          placeholder="e.g. Tickets will go on sale soon. Join the waitlist to get early access!"
                          className="w-full px-3.5 py-2 bg-white border border-amber-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-amber-500 shadow-2xs"
                        />
                        <div className="p-3 rounded-lg bg-amber-100/70 border border-amber-200 text-amber-950 flex items-start gap-2.5 text-xs">
                          <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block text-amber-900 text-[10px] uppercase">Attendee Preview</span>
                            <p className="mt-0.5 text-zinc-800">{preSaleMessage || 'Tickets will go on sale soon.'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Post-sales Message Input & Live Preview */}
                    {statusMessageType === 'post_sales' && (
                      <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Post-sales Notice Message</span>
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            Post-Sales Mode
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={postSaleMessage}
                          onChange={(e) => setPostSaleMessage(e.target.value)}
                          placeholder="e.g. Ticket sales have ended. Thank you for your support!"
                          className="w-full px-3.5 py-2 bg-white border border-rose-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-rose-500 shadow-2xs"
                        />
                        <div className="p-3 rounded-lg bg-rose-100/70 border border-rose-200 text-rose-950 flex items-start gap-2.5 text-xs">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-700 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block text-rose-900 text-[10px] uppercase">Attendee Preview</span>
                            <p className="mt-0.5 text-zinc-800">{postSaleMessage || 'Ticket sales have ended.'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Event Review & Command Hub Handoff Card */}
                  <div className="p-5 rounded-2xl bg-zinc-950 text-white space-y-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#E31B23]" />
                        <h4 className="text-sm font-black">Pre-Flight Review</h4>
                      </div>
                      <span className="text-xs font-black text-emerald-400">{readinessPercentage}% Ready</span>
                    </div>

                    {/* Readiness Bar */}
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#E31B23] to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${readinessPercentage}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                        <span className="text-zinc-400 text-[10px] uppercase font-bold block">Format</span>
                        <span className="font-bold text-white mt-0.5 block truncate">{eventFormat}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                        <span className="text-zinc-400 text-[10px] uppercase font-bold block">
                          {locationType === 'physical' ? 'Venue' : 'Format'}
                        </span>
                        <span className="font-bold text-white mt-0.5 block truncate">
                          {locationType === 'online' ? 'Virtual or Online Event' : (venue || 'Venue')}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 col-span-2 sm:col-span-1">
                        <span className="text-zinc-400 text-[10px] uppercase font-bold block">Date</span>
                        <span className="font-bold text-white mt-0.5 block truncate">
                          {startDate ? formatDate(startDate) : 'To be set'}
                        </span>
                      </div>
                    </div>

                    {/* Handoff Notice */}
                    <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-3">
                      <Ticket className="w-4 h-4 text-[#E31B23] flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5 text-[11px] leading-relaxed">
                        <span className="font-bold text-white block">Tickets & Policies in Event Command Hub</span>
                        <p className="text-zinc-300">
                          After creating this event, you will be redirected to the Event Command Hub where you can add VIP & regular ticket tiers, pricing, attendee questions, and refund rules.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handlePublish('Draft')}
                        className="flex-1 py-3.5 px-5 border border-zinc-700 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        <span>{perms.canConfigureTickets ? 'Save as Draft & Configure Tickets' : 'Save Event as Draft'}</span>
                      </button>

                      {perms.canPublishEvents && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handlePublish('Published')}
                          className="flex-1 py-3.5 px-5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg active:scale-[0.99]"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isEditing ? (
                            <Sparkles className="w-4 h-4" />
                          ) : (
                            <Rocket className="w-4 h-4" />
                          )}
                          <span>{isEditing ? 'Update & Manage Event' : 'Launch Experience Live'}</span>
                        </button>
                      )}
                    </div>
                    {!perms.canPublishEvents && (
                      <p className="text-xs text-zinc-400 mt-2 text-center">
                        You have Manager permissions to draft events. An Admin or Owner will review and publish this event live.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Stepper Navigation Buttons */}
              <div className="flex justify-between items-center border-t border-zinc-100 pt-6 mt-2">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(prev => prev - 1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div className="text-[11px] font-semibold text-zinc-400">
                    Step 1 of 5
                  </div>
                )}

                {step < 5 ? (
                  <div className="flex items-center gap-3">
                    {step === 1 && !isStep1Complete && (
                      <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1.5 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Name & description required</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleProceedNext}
                      disabled={isLoading || (step === 1 && !isStep1Complete)}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${step === 1 && !isStep1Complete
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200 shadow-none'
                        : 'bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer shadow-sm hover:shadow active:scale-[0.99]'
                        }`}
                    >
                      <span>Continue to {STEPS[step]?.label || 'Next'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div />
                )}
              </div>

            </div>
        </div>

      </div>
    </OrganizerDashboardLayout>
  );
};

export default CreateEvent;
