import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './EventsPage.css';
import AnimatedNav from './AnimatedNav';
import CreatePostModal from './CreatePostModal';
import ImageCropper from './ImageCropper';
import { CustomDatePicker, CustomTimePicker } from './DateTimePicker';
import { CountrySelect, PhoneInput } from './CountryPicker';
import SkeletonImg from '../SkeletonImg';
import Loader from '../Loader';
import ShareSheet from './ShareSheet';
import './ShareSheet.css';
import {
  fetchEvents, fetchEventDetail, createEvent, updateEvent, deleteEvent,
  saveEvent, unsaveEvent,
  fetchMyBooked, fetchMySaved, fetchMyCreated, publishEvent, reportEvent,
  calendarEvent, uncalendarEvent, setEventSoldOut, clearEventDeletedNotice,
} from '../../store/slices/eventsSlice';
import { showToast } from '../../store/slices/toastSlice';
import { apiRequest } from '../../services/api';
import { fetchConnections } from '../../store/slices/profileSlice';
import { joinEventRoom, leaveEventRoom } from '../../services/socket';

/* ── Sidebar nav icons ── */
function FeedNavIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function EventNavIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function GroupsNavIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function CalendarNavIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><rect x="8" y="14" width="2" height="2" rx="0.5"/></svg>; }
function MessagesNavIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }

/* ── Event type icons ── */
function OnlineIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>; }
function OfflineIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function BothIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="13" height="13" rx="2"/><path d="M8 21h13a2 2 0 0 0 2-2V8"/></svg>; }

/* ── Visibility icons (same set/values as post visibility) ── */
function GlobeIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }
function FriendsIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function LockIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function ImageIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>; }

function timeAgo(dateStr) {
  if (!dateStr) return 'Just now';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const VISIBILITY_OPTIONS = [
  { id: 'anyone',  label: 'Anyone',       icon: <GlobeIcon />   },
  { id: 'friends', label: 'Friends only', icon: <FriendsIcon /> },
  { id: 'only_me', label: 'Only me',      icon: <LockIcon />    },
];

/* ── Misc icons ── */
function ChevronDownIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>; }
function ArrowRightIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>; }
function ArrowLeftIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>; }
function StarIcon()        { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function CoverCloseIcon()  { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function TrashIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>; }
function TicketIcon()      { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>; }
function ClockIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function PlusIcon()        { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function CalendarIcon({ size = 14 })    { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }

// Shared "no photo" placeholder — used for card thumbnails and the detail
// cover whenever an event has no image, or its image URL fails to load.
function EventImgPlaceholder({ size = 32 }) {
  return (
    <div className="ev-img-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: 'rgba(255, 255, 255, 0.3)' }}>
      <CalendarIcon size={size} />
      <span style={{ fontSize: '12px', fontWeight: '500' }}>Kink Catalyst</span>
    </div>
  );
}
function MapPinIcon()      { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function ParkingIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>; }
function OrganizerIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function MonitorIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>; }
function PinMapIcon()      { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function ExternalLinkIcon(){ return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>; }
function EditIcon()        { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function SearchIcon()      { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function LinkIcon()        { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>; }
function ShareIcon()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>; }

/* ── Category icons ── */
function AllIcon()         { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>; }
function MusicIcon()       { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13M9 9h12"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>; }
function TechIcon()        { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>; }
function BusinessIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>; }
function ArtIcon()         { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="1"/><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6h.01"/><path d="M19 6h.01"/><path d="M5 14h.01"/><path d="M19 14h.01"/></svg>; }
function SportsIcon()      { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>; }
function EducationIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></svg>; }
function FoodIcon()        { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>; }
function HealthIcon()      { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>; }
function OtherIcon()       { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>; }

/* ── Discovery mock data ── */
const DISC_CATEGORIES = [
  { label: 'All', icon: <AllIcon /> },
  { label: 'Music', icon: <MusicIcon /> },
  { label: 'Sports', icon: <SportsIcon /> },
  { label: 'Education', icon: <EducationIcon /> },
  { label: 'Business', icon: <BusinessIcon /> },
  { label: 'Arts & Culture', icon: <ArtIcon /> },
  { label: 'Food & Drink', icon: <FoodIcon /> },
  { label: 'Technology', icon: <TechIcon /> },
  { label: 'Health & Wellness', icon: <HealthIcon /> },
  { label: 'Other', icon: <OtherIcon /> },
];

export const BOOKED_EVENTS = [
  {
    id: 'b1', day: '05', month: 'OCT', monthFull: 'October',
    fullDate: 'Sunday 5 October 2025 at 09:00',
    img: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&q=80&fit=crop',
    category: 'Tech', catColor: '#0891b2', location: 'San Jose, CA',
    title: 'Design Systems Summit 2024',
    desc: 'A deep dive into scalable design systems, component libraries and tooling for modern teams.',
    attending: '3.2k', seats: null, soldOut: false, responded: '3,200',
    about: 'Design Systems Summit brings together the world\'s leading design engineers, product designers, and engineering leaders for two days of in-depth workshops and talks. Explore token-based theming, component governance, accessibility at scale, and the future of collaborative design tooling. Whether you\'re just starting a design system or scaling one across hundreds of teams, this is the event for you.',
    venue: 'San Jose Convention Center, South Hall',
  },
  {
    id: 'b2', day: '18', month: 'OCT', monthFull: 'October',
    fullDate: 'Saturday 18 October 2025 at 18:00',
    img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80&fit=crop',
    category: 'Business', catColor: '#059669', location: 'Seattle, WA',
    title: 'Founders Forum 2024',
    desc: 'An exclusive gathering of founders, VCs and operators sharing lessons from building companies.',
    attending: '1.8k', seats: '10 seats left', soldOut: false, responded: '1,800',
    about: 'Founders Forum is the most intimate gathering of builders and investors in the Pacific Northwest. Hear candid stories from founders who\'ve navigated product-market fit, rapid scaling, and pivots. Connect one-on-one with top-tier VCs, angels, and operators in a setting designed for real conversations, not pitches. Applications are reviewed — only verified founders and operators gain entry.',
    venue: 'Hyatt Regency Seattle, Grand Ballroom',
  },
  {
    id: 'b3', day: '30', month: 'OCT', monthFull: 'October',
    fullDate: 'Thursday 30 October 2025 at 09:00',
    img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80&fit=crop',
    category: 'Workshop', catColor: '#f59e0b', location: 'Remote',
    title: 'Full-Stack Web Dev Bootcamp',
    desc: 'Intensive 2-day workshop covering React, Node.js and cloud deployment with hands-on projects.',
    attending: '540', seats: '5 seats left', soldOut: false, responded: '540',
    about: 'This hands-on 2-day intensive covers the modern full-stack JavaScript ecosystem from scratch to deployment. Day one focuses on React 19 patterns, state management, and component architecture. Day two dives into Node.js APIs, database integration, and deploying on cloud platforms. You\'ll leave with a fully built project, reviewed code, and a mentor\'s feedback on your architecture decisions.',
    venue: 'Virtual — Zoom + Discord',
  },
];

export const DISC_EVENTS = [
  {
    id: 'd1', day: '24', month: 'OCT', monthFull: 'October',
    fullDate: 'Thursday 24 October 2025 at 21:00',
    img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80&fit=crop',
    category: 'Live Music', catColor: '#7c3aed', location: 'Austin, TX',
    title: 'Neon Beats: Electronic Night',
    desc: 'Experience the pulse of modern electronic beats in an immersive 360-degree sound environment.',
    attending: '1.2k', seats: '45 seats left', soldOut: false, responded: '1,200',
    about: 'Neon Beats is Austin\'s most anticipated underground electronic music event. An immersive 360-degree audio-visual experience featuring headlining DJs from Berlin, Amsterdam, and Tokyo, laser installations, and a lineup that spans house, techno, and ambient electronica. Doors open at 9 PM, headliners hit the stage at midnight. General and VIP areas available.',
    venue: 'Austin360 Amphitheatre, Circuit of the Americas',
  },
  {
    id: 'd2', day: '15', month: 'NOV', monthFull: 'November',
    fullDate: 'Saturday 15 November 2025 at 09:00',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80&fit=crop',
    category: 'Tech & Startup', catColor: '#0891b2', location: 'San Francisco, CA',
    title: 'Future of AI: Innovation Summit',
    desc: 'Join industry leaders for a deep dive into the next generation of artificial intelligence and technology.',
    attending: '2.5k', seats: '120 seats left', soldOut: false, responded: '2,500',
    about: 'The Future of AI Summit assembles researchers, founders, and enterprise leaders building the next generation of intelligent systems. Tracks cover foundation models, multimodal AI, agentic systems, AI safety, and enterprise adoption. Expect live demos, panel debates, and direct access to the minds shaping the trajectory of artificial intelligence over the next decade.',
    venue: 'Moscone Center, West Hall',
  },
  {
    id: 'd3', day: '02', month: 'DEC', monthFull: 'December',
    fullDate: 'Tuesday 2 December 2025 at 19:00',
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80&fit=crop',
    category: 'Business', catColor: '#059669', location: 'New York, NY',
    title: 'Executive Networking Mixer',
    desc: 'An exclusive evening for senior executives and entrepreneurs to connect in a premium setting.',
    attending: '800', seats: '25 seats left', soldOut: false, responded: '800',
    about: 'A curated evening of high-signal networking for C-suite leaders, serial entrepreneurs, and Fortune 500 decision-makers. Hosted in a private penthouse setting with a 3-course dinner, open bar, and structured introductions — no pitches, no slides, just genuine conversation. Attendees are vetted. Each ticket grants access to our private Slack community for ongoing connections.',
    venue: 'The Pierre Hotel, Grand Ballroom',
  },
  {
    id: 'd4', day: '12', month: 'DEC', monthFull: 'December',
    fullDate: 'Friday 12 December 2025 at 10:00',
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80&fit=crop',
    category: 'Art & Design', catColor: '#db2777', location: 'London, UK',
    title: 'Creative Design Workshop',
    desc: 'Master the fundamentals of modern UI/UX design in this hands-on intensive workshop.',
    attending: '300', seats: null, soldOut: true, responded: '300',
    about: 'This sold-out intensive workshop covers the full design thinking process from user research to high-fidelity prototyping. Led by senior designers from top studios, the day is structured around real briefs with peer critique sessions. Participants receive Figma templates, a curated resource pack, and lifetime access to workshop recordings. Entry is no longer available — join the waitlist for future dates.',
    venue: 'The Design Museum, Commonwealth Room, London',
  },
  {
    id: 'd5', day: '20', month: 'JAN', monthFull: 'January',
    fullDate: 'Tuesday 20 January 2026 at 19:30',
    img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80&fit=crop',
    category: 'Music', catColor: '#7c3aed', location: 'Chicago, IL',
    title: 'Jazz Under the Stars',
    desc: 'A magical evening of live jazz performances under the open sky with top artists from around the world.',
    attending: '950', seats: '60 seats left', soldOut: false, responded: '950',
    about: 'Jazz Under the Stars is a landmark event in Chicago\'s annual music calendar. Set against the iconic skyline, the evening features four headline acts spanning bebop, fusion, and contemporary jazz. Guests are invited to bring blankets, enjoy curated food vendors, and lose themselves in two hours of uninterrupted live performance. Weather contingency plan in place — event will move to the indoor pavilion if needed.',
    venue: 'Millennium Park, Jay Pritzker Pavilion',
  },
  {
    id: 'd6', day: '28', month: 'JAN', monthFull: 'January',
    fullDate: 'Wednesday 28 January 2026 at 14:00',
    img: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=600&q=80&fit=crop',
    category: 'Workshop', catColor: '#f59e0b', location: 'Berlin, DE',
    title: 'Startup Pitch Competition',
    desc: 'Present your startup idea to top-tier investors and win funding, mentorship, and global recognition.',
    attending: '420', seats: '15 seats left', soldOut: false, responded: '420',
    about: 'Berlin\'s premier startup pitch competition returns for its 8th edition. Teams of up to 3 founders get 5 minutes to pitch and 5 minutes of Q&A in front of a panel of 12 leading European VCs. Top 3 teams win cash prizes (€50k, €20k, €10k), 6 months of co-working space, and fast-track consideration from participating funds. Apply early — only 30 slots available across 8 verticals.',
    venue: 'Factory Berlin, Görlitzer Park Campus',
  },
];

// Show exactly the images the event actually has — never pad with stock
// photos, or a 2-image event renders as a 5-image gallery.
function getEventImages(ev) {
  if (!ev) return [];
  if (Array.isArray(ev.coverImages) && ev.coverImages.length) return ev.coverImages;
  if (Array.isArray(ev.images) && ev.images.length) return ev.images;
  return ev.img ? [ev.img] : [];
}

// 'Other' is stored literally as the category, with the actual typed value
// kept separately in customCategory — this is what should show to users.
function displayCategory(ev) {
  if (!ev) return '';
  return ev.category === 'Other' ? (ev.customCategory || ev.category) : ev.category;
}

// createdBy may come back as a plain id string or a populated user object,
// depending on the endpoint — normalize before comparing to the logged-in user.
function eventOwnerId(ev) {
  const c = ev?.createdBy;
  if (!c) return null;
  return typeof c === 'string' ? c : (c._id ?? c.id ?? null);
}

function eventPermalink(id) {
  return `${window.location.origin}/events/${id}`;
}

// Google's plain "q=<address>&output=embed" iframe form needs no API key
// (unlike the JS Maps SDK) — it just shows a "for development purposes"
// watermark, which is an acceptable tradeoff against paying for/managing a
// Maps API key for a simple address preview.
function googleMapsEmbedSrc(address) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}
function googleMapsSearchUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

// Cards clamp the description to 2 lines via CSS (-webkit-line-clamp), which
// has no JS-visible "did it actually truncate" signal — a character-count
// heuristic is close enough to decide whether "See more" is worth showing,
// without measuring scrollHeight per card on every render.
const CARD_DESC_TRUNCATE_AT = 110;
function isCardDescTruncated(desc) {
  return !!desc && desc.length > CARD_DESC_TRUNCATE_AT;
}


// Defensive field-name fallbacks — the discussions API's exact response
// shape (id vs _id, likes vs likeCount, isLiked vs likedByMe, ...) wasn't
// pinned down before implementing, so each normalizer accepts the common
// naming variants rather than assuming one.
function normalizeDiscussionAuthor(a) {
  if (!a) return { id: '', name: 'Someone', avatar: '' };
  return {
    id: a.id ?? a._id ?? a.userId ?? '',
    name: a.fullName ?? a.name ?? 'Someone',
    avatar: a.avatar?.startsWith?.('http') ? a.avatar : '',
  };
}

function normalizeDiscReply(r) {
  return {
    id: r.id ?? r._id,
    author: normalizeDiscussionAuthor(r.author ?? r.user),
    text: r.text ?? r.content ?? '',
    time: timeAgo(r.createdAt ?? r.time),
    likeCount: r.likeCount ?? r.likesCount ?? r.likes ?? 0,
    likedByMe: !!(r.isLiked ?? r.likedByMe ?? r.hasLiked),
  };
}

function normalizeDiscComment(c) {
  return {
    id: c.id ?? c._id,
    author: normalizeDiscussionAuthor(c.author ?? c.user),
    text: c.text ?? c.content ?? '',
    time: timeAgo(c.createdAt ?? c.time),
    likeCount: c.likeCount ?? c.likesCount ?? c.likes ?? 0,
    likedByMe: !!(c.isLiked ?? c.likedByMe ?? c.hasLiked),
    replies: (c.replies ?? []).map(normalizeDiscReply),
  };
}

function normalizeDiscussion(d) {
  const rawMedia = d.media ?? d.images ?? [];
  return {
    id: d.id ?? d._id,
    author: normalizeDiscussionAuthor(d.author ?? d.user),
    caption: d.caption ?? d.text ?? '',
    media: rawMedia.map(m => (typeof m === 'string'
      ? { url: m, type: /\.(mp4|mov|webm)$/i.test(m) ? 'video' : 'image' }
      : { url: m.url ?? m.secure_url ?? '', type: m.type ?? (m.resourceType === 'video' ? 'video' : 'image') }
    )),
    likeCount: d.likeCount ?? d.likesCount ?? d.likes ?? 0,
    likedByMe: !!(d.isLiked ?? d.likedByMe ?? d.hasLiked),
    commentCount: d.commentCount ?? d.commentsCount ?? (d.comments?.length ?? 0),
    comments: (d.comments ?? []).map(normalizeDiscComment),
    time: timeAgo(d.createdAt ?? d.time),
  };
}

function ChevronLeftIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevronRightIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }

function EventCarousel({ images, alt }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setIdx(i => (i + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images]);

  if (!images || images.length === 0) return null;

  function prev(e) { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }
  function next(e) { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }

  return (
    <>
      <SkeletonImg src={images[idx]} alt={alt} className="ev-detail-cover-img" fallback={<EventImgPlaceholder size={44} />} />
      {images.length > 1 && (
        <>
          <button className="ev-carousel-arrow ev-carousel-arrow--prev" onClick={prev} title="Previous photo"><ChevronLeftIcon /></button>
          <button className="ev-carousel-arrow ev-carousel-arrow--next" onClick={next} title="Next photo"><ChevronRightIcon /></button>
          <div className="ev-carousel-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`ev-carousel-dot${i === idx ? ' ev-carousel-dot--active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                title={`Photo ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

const INVITE_AVATAR_COLORS = ['#7c3aed', '#0891b2', '#059669', '#f59e0b', '#ef4444', '#3b82f6'];

function reviewInitials(name = '') { return name.split(' ').map(w => w[0]).join('').toUpperCase(); }
// Meeting link is prefilled with "https://" (see the virtual state default), so a plain
// truthy/non-empty check would pass even when nothing real was typed after the prefix.
function hasMeaningfulLink(link) { return link.trim().replace(/^https?:\/\//, '').length > 0; }
// Only the first character is forced — the rest of what's typed is left alone,
// so this doesn't fight the user mid-sentence the way a full auto-caps would.
function capitalizeFirst(str) { return str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : str; }
function CheckIcon()       { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function BackArrowIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>; }
function SendIcon()        { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>; }
function ThumbUpIcon()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>; }
function FlagIcon()        { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>; }

export const CREATED_EVENTS = [
  {
    id: 'c1', day: '15', month: 'JUL', monthFull: 'July',
    fullDate: 'Wednesday 15 July 2026 at 18:00',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80&fit=crop',
    category: 'Tech & Startup', catColor: '#0891b2',
    location: 'Bengaluru, India',
    title: 'DevFest India 2026',
    desc: 'Annual developer festival bringing together 5000+ engineers, designers and product leaders.',
    attending: '4.8k', seats: '200 seats left', soldOut: false, responded: '4,820',
    about: 'DevFest India is the largest annual developer festival in South Asia, bringing together engineers, designers, product managers, and tech leaders from across the country and beyond. This year\'s theme is "Build for Billions" — focusing on AI-first products, scalable infrastructure, and developer experience. Expect 60+ sessions, live demos, hackathons, and networking with the brightest minds in tech.',
    venue: 'KTPO Convention Centre, Whitefield',
  },
  {
    id: 'c2', day: '28', month: 'AUG', monthFull: 'August',
    fullDate: 'Friday 28 August 2026 at 19:30',
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80&fit=crop',
    category: 'Art & Design', catColor: '#db2777',
    location: 'Mumbai, India',
    title: 'Design Spectrum 2026',
    desc: 'A premier design conference exploring the intersection of technology, creativity, and human experience.',
    attending: '2.1k', seats: '50 seats left', soldOut: false, responded: '2,140',
    about: 'Design Spectrum is a premier design conference that brings together the world\'s most innovative designers, creative directors, and product thinkers. Explore workshops, keynotes, and exhibitions spanning UI/UX, motion, brand identity, and emerging creative tools. A one-of-a-kind event where craft meets culture.',
    venue: 'Nesco Exhibition Centre, Goregaon',
  },
];

// Falls back to "Online" (instead of "N/A") when the event has no physical
// venue/location because it's an online-only event.
function eventLocationLabel(ev) {
  if (!ev) return 'N/A';
  const loc = ev.venue || ev.location;
  if (loc) return loc;
  return ev.eventType === 'online' ? 'Online' : 'N/A';
}

// Attendee list API returns either a flat user record or one nested under
// `user` — accept both, same defensive pattern as the discussion normalizers.
function normalizeAttendee(a) {
  const u = a?.user ?? a ?? {};
  const avatar = u.avatar ?? u.profileImage ?? u.photo ?? '';
  return {
    id:     u.id ?? u._id ?? u.userId ?? a?.id ?? a?._id ?? a?.userId ?? '',
    name:   u.fullName ?? u.name ?? 'Someone',
    avatar: typeof avatar === 'string' && avatar.startsWith('http') ? avatar : '',
  };
}

const TICKET_ICONS = { star: <StarIcon />, ticket: <TicketIcon />, clock: <ClockIcon /> };
const MAX_PER_USER_OPTIONS = ['1', '2', '3', '4', '5', '10', 'Unlimited'];

const EV_NAV = [
  { id: 'feed',     label: 'Feed',     icon: <FeedNavIcon /> },
  { id: 'event',    label: 'Event',    icon: <EventNavIcon />,  active: true },
  { id: 'groups',   label: 'Groups',   icon: <GroupsNavIcon /> },
  { id: 'calendar', label: 'Calendar', icon: <CalendarNavIcon /> },
  { id: 'messages', label: 'Messages', icon: <MessagesNavIcon /> },
];

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Plans & Pricing' },
  { id: 3, label: 'Location/ Venue' },
  { id: 4, label: 'Review' },
];

const CATEGORIES = [
  'Music', 'Sports', 'Education', 'Business', 'Arts & Culture',
  'Food & Drink', 'Technology', 'Health & Wellness', 'Other',
];

const EVENT_TYPES = [
  { id: 'online',  label: 'Online',  icon: <OnlineIcon /> },
  { id: 'offline', label: 'Offline', icon: <OfflineIcon /> },
  { id: 'both',    label: 'Both',    icon: <BothIcon /> },
];

const HEART_BURST_PATHS = [
  { dx: -36, dy: -52, rot: -30 },
  { dx: -16, dy: -62, rot:  15 },
  { dx:   6, dy: -66, rot: -10 },
  { dx:  28, dy: -52, rot:  25 },
  { dx:  40, dy: -32, rot: -20 },
  { dx: -44, dy: -28, rot:  30 },
  { dx:  -8, dy: -58, rot: -18 },
];

// Shared by both the "add new ticket" panel (always at the bottom of the list)
// and the "edit ticket" panel (rendered inline, right under the ticket being
// edited) so editing a ticket doesn't visually jump you down to the bottom.
function TicketFormPanel({ isEditing, newTicket, onChange, onSave, onCancel }) {
  function blockNegativeKeys(e) {
    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') e.preventDefault();
  }
  return (
    <div className="ev-new-ticket-form">
      <div className="ev-new-ticket-header">
        <span>{isEditing ? 'Edit Ticket Type' : 'New Ticket Type'}</span>
        <button type="button" className="ev-cancel-ticket-btn" onClick={onCancel}>✕</button>
      </div>
      <div className="ev-new-ticket-body">
        <div className="ev-field">
          <label className="ev-label ev-label--small">Ticket Name</label>
          <input className="ev-input" name="name" value={newTicket.name} onChange={onChange} placeholder="e.g. Student Discount" />
        </div>
        <div className="ev-field">
          <label className="ev-label ev-label--small">Description</label>
          <textarea className="ev-textarea ev-textarea--sm" name="description" value={newTicket.description} onChange={onChange} placeholder="e.g. Valid ID required at entry" rows={3} />
        </div>
        <div className="ev-field-row">
          <div className="ev-field">
            <label className="ev-label ev-label--small">Price ($)</label>
            <input className="ev-input" name="price" type="number" min="0" step="0.01" value={newTicket.price} onChange={onChange} onKeyDown={blockNegativeKeys} />
          </div>
          <div className="ev-field">
            <label className="ev-label ev-label--small">Total Seats</label>
            <input className="ev-input" name="seats" type="number" min="1" value={newTicket.seats} onChange={onChange} onKeyDown={blockNegativeKeys} placeholder="e.g. 50" />
          </div>
        </div>
        <div className="ev-field">
          <label className="ev-label ev-label--small">Max Tickets Per User</label>
          <div className="ev-select-wrap">
            <select className="ev-select" name="maxPerUser" value={newTicket.maxPerUser} onChange={onChange}>
              {MAX_PER_USER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDownIcon />
          </div>
        </div>
        <div className="ev-new-ticket-actions">
          <button type="button" className="ev-save-ticket-btn" onClick={onSave}>{isEditing ? 'Save Changes' : 'Save Ticket'}</button>
          <button type="button" className="ev-cancel-ticket-btn-text" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Create-wizard defaults. Kept at module level so opening the wizard and
// resetting it after a save use the exact same starting state — otherwise the
// form keeps the previously created event's data and "Create Event" opens
// pre-filled with the last event.
const EMPTY_EVENT_FORM = {
  title: '', tagline: '', description: '',
  startDate: '', endDate: '', startTime: '', endTime: '',
  isAllDay: false, category: '', categoryOther: '', eventType: 'offline', visibility: 'anyone',
};
const DEFAULT_TICKETS = [
  { id: '1', name: 'VIP Access',        price: '150', seats: '50',  iconType: 'star'   },
  { id: '2', name: 'General Admission', price: '45',  seats: '150', iconType: 'ticket' },
  { id: '3', name: 'Early Bird',        price: '30',  seats: '100', iconType: 'clock'  },
];
const EMPTY_NEW_TICKET  = { name: '', description: '', price: '0.00', seats: '100', maxPerUser: '1' };
const DEFAULT_REGISTRATION = { ticketPrice: '150', totalSeats: '', maxPerUser: '4', deadline: '' };
const EMPTY_VENUE     = { name: '', street: '', city: '', state: '', country: '', pinCode: '' };
const EMPTY_ORGANIZER = { fullName: '', email: '', phone: '' };
const DEFAULT_VIRTUAL = { link: 'https://', instructions: '' };

export default function EventsPage({ onBack, onEventsClick, onGroupsClick, onCalendarClick, onMessagesClick, onLibraryClick, onCoursesClick, onMinisitesClick, startCreate, initialEventId, initialDetailTab, onInitEventConsumed, onUserClick, onViewStateChange }) {
  const [showCreate,    setShowCreate]    = useState(startCreate || false);
  const [discTab,       setDiscTab]       = useState('upcoming');
  // Sub-tab within "My Created Events" — filters createdEvents by status.
  const [createdTab,    setCreatedTab]    = useState('published');
  // Sub-tab within "Upcoming Events" — the backend's `tab=upcoming` query
  // param only ever returns events dated today or later, so this is a
  // client-side split of that same list rather than a second fetch.
  const [upcomingSubTab, setUpcomingSubTab] = useState('upcoming');
  // Keyword search box next to the category chips — filters client-side
  // (see filteredEvents below), so it applies instantly with no debounce.
  const [discSearch,     setDiscSearch]     = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [evDetailTab,   setEvDetailTab]   = useState('about');
  const [eventFromHome, setEventFromHome] = useState(false);
  const [joinedIds,     setJoinedIds]     = useState(new Set());
  // The event's own creator can always see the discussion — everyone else
  // has to actually join first, same as the "+ Join" button gates. Declared
  // up here (not near the JSX that uses it) so effects earlier in the
  // component can also depend on it without a temporal-dead-zone error.
  const canViewDiscussion = !!selectedEvent && (selectedEvent._sourceTab === 'created' || joinedIds.has(selectedEvent.id));
  const [attendeeCount, setAttendeeCount] = useState({});
  // Full attendee list per event — { [eventId]: [{ id, name, avatar }] }.
  // The Details card's avatar stack shows just the first 4 (sliced at
  // render time); the "X attending" click opens a modal over the same data.
  const [attendeeList, setAttendeeList] = useState({});
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  // Set when the event currently open in detail view gets deleted by an
  // admin (socket: event:deleted) — shows a blocking notice with the reason,
  // then redirects back to the list on dismiss. See eventDeletedNotice effect.
  const [deletedNoticeModal, setDeletedNoticeModal] = useState(null);
  // "See more" on a card's clamped description opens this event's full text
  // in a lightweight modal, instead of navigating into the full detail page.
  const [descModalEvent, setDescModalEvent] = useState(null);
  const [joiningId,     setJoiningId]     = useState(null);
  // "+ Join" ticket → attendee-details flow. null when closed.
  // { eventId, step: 'ticket'|'members', tickets, ticketsLoading, ticketId, quantity, members, submitting }
  const [joinFlow,      setJoinFlow]      = useState(null);
  // Event discussion feed — posts (with optional photo/video) rather than
  // flat comments, each with its own nested comments/replies/likes.
  const [discussions,        setDiscussions]        = useState([]);
  const [discussionsLoading, setDiscussionsLoading]  = useState(false);
  const [discussionsPage,    setDiscussionsPage]     = useState(1);
  const [discussionsHasMore, setDiscussionsHasMore]  = useState(false);
  const [discPostCaption,    setDiscPostCaption]     = useState('');
  const [discPostMedia,      setDiscPostMedia]       = useState([]); // [{ file, url, type }]
  const [discPosting,        setDiscPosting]         = useState(false);
  // Proper modal composer (matches the main Feed's "Create Post") instead of
  // a single-line inline bar — images go through the same crop flow the
  // Create Event cover photo upload already uses.
  const [discComposerOpen,   setDiscComposerOpen]    = useState(false);
  const [discCropQueue,      setDiscCropQueue]       = useState([]);
  const [discCropIndex,      setDiscCropIndex]       = useState(0);
  // Which single post currently has its comment section expanded — like a
  // normal feed, only one at a time to keep the per-post input state simple.
  const [discExpandedId,     setDiscExpandedId]      = useState(null);
  const [discCommentText,    setDiscCommentText]     = useState({}); // { [discussionId]: text }
  const [discCommentBusy,    setDiscCommentBusy]     = useState(false);
  // Which comment a reply box is open under — { discussionId, commentId } | null
  const [discReplyTarget,    setDiscReplyTarget]     = useState(null);
  const [discReplyText,      setDiscReplyText]       = useState('');
  const [discReplyBusy,      setDiscReplyBusy]       = useState(false);
  const discMediaInputRef = useRef(null);
  const [moreOpen,      setMoreOpen]      = useState(false);
  // Event "..." menu: Share sheet + Report modal — both dispatched from menu
  // items but rendered outside the menu (like the create-event / join-flow
  // modals below) so they survive the menu itself closing.
  const [shareOpen,        setShareOpen]        = useState(false);
  const [reportOpen,       setReportOpen]       = useState(false);
  const [reportReason,     setReportReason]     = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone,       setReportDone]       = useState(false);
  const [discCat,       setDiscCat]       = useState('All');
  const [savedIds,       setSavedIds]       = useState(new Set());
  const [calendarIds,    setCalendarIds]    = useState(new Set());
  const [heartingIds,    setHeartingIds]    = useState(new Set());
  const [heartParticles, setHeartParticles] = useState({});
  const [showFilter,    setShowFilter]    = useState(false);
  const [viewMode,      setViewMode]      = useState('grid');
  const [filters,       setFilters]       = useState({ eventType: 'all', categories: new Set(), country: '', city: '', state: '' });
  const [pendingF,      setPendingF]      = useState({ eventType: 'all', categories: new Set(), country: '', city: '', state: '' });
  const [step, setStep] = useState(1);
  const [animDir, setAnimDir] = useState('forward');
  const [createPostOpen, setCreatePostOpen] = useState(false);
  // Cover images — array of { id, file, url } so multiple can be uploaded and
  // individually removed, instead of a single file that gets replaced.
  const [coverImages, setCoverImages] = useState([]);
  // One-at-a-time crop flow for freshly-picked cover files, same pattern as
  // the post composer's photo uploads.
  const [coverCropQueue, setCoverCropQueue] = useState([]);
  const [coverCropIndex, setCoverCropIndex] = useState(0);
  // When editing an existing event, its already-uploaded images (plain URL
  // strings, no File to re-upload) — kept separate from the new-file uploads
  // above so each set can be removed/added to independently.
  const [existingCoverImages, setExistingCoverImages] = useState([]);
  // Non-null while the create form is being used to edit an existing event —
  // switches handlePublish to PUT instead of POST.
  const [editingEventId, setEditingEventId] = useState(null);
  // True while re-downloading existing cover images into real File objects
  // before an edit submit — see handlePublish's PUT branch for why.
  const [preparingImages, setPreparingImages] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);

  // Redux
  const dispatch = useDispatch();
  const { user: authUser, token: authToken } = useSelector(s => s.auth);
  const myId = authUser?._id ?? authUser?.id ?? null;
  // Own events should always offer "Manage Event", not "+ Join" / "Booked" —
  // even outside the My Created Events tab, since Upcoming/Booked/Favorites
  // can all surface events the current user created.
  const isMyEvent = ev => !!myId && eventOwnerId(ev) === myId;
  const { connections } = useSelector(s => s.profile);
  const { blockedUserIds } = useSelector(s => s.users);
  const {
    events: rdxEvents, eventsLoading,
    bookedEvents, bookedLoading,
    savedEvents, savedLoading,
    createdEvents, createdLoading,
    eventDetail,
    createLoading, updateLoading, publishingId, soldOutTogglingId,
    eventDeletedNotice,
  } = useSelector(s => s.events);

  // An admin deleted this event elsewhere while it was open here — the
  // reducer has already dropped it from every list; if it's the event on
  // screen right now, surface the notice as a blocking modal.
  useEffect(() => {
    if (!eventDeletedNotice) return;
    if (selectedEvent?.id === eventDeletedNotice.eventId) {
      setDeletedNoticeModal(eventDeletedNotice);
    }
    dispatch(clearEventDeletedNotice());
  }, [eventDeletedNotice]); // eslint-disable-line

  // Opened from elsewhere (e.g. the Calendar page) with a specific event id
  // to jump straight to — fetch it directly by id rather than searching
  // whatever event lists happen to already be loaded client-side, which
  // would silently fail if that list hasn't been fetched yet (or, before
  // this fix, was permanently pointed at the old hardcoded mock arrays).
  useEffect(() => {
    if (!initialEventId) return;
    dispatch(fetchEventDetail(initialEventId)).then(action => {
      if (fetchEventDetail.fulfilled.match(action)) {
        setSelectedEvent({ ...action.payload, _sourceTab: 'upcoming' });
        setEvDetailTab(initialDetailTab === 'discussion' ? 'discussion' : 'about');
        setEventFromHome(true);
      }
      onInitEventConsumed?.();
    });
  }, [initialEventId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Report the currently-open event/tab/create-flow up to HomePage so it can
  // keep the URL in sync (?section=events&id=&tab=&create=) — this is what
  // lets a refresh land back on this exact event, not just the Events list.
  useEffect(() => {
    onViewStateChange?.({
      eventId: selectedEvent?.id ?? null,
      tab: selectedEvent ? evDetailTab : null,
      createOpen: showCreate,
    });
  }, [selectedEvent?.id, evDetailTab, showCreate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 4's Invite Friends panel needs the real connections list, not
  // fetched until the review step is actually reached.
  useEffect(() => {
    if (step === 4) dispatch(fetchConnections());
  }, [step]);

  // Fetch on tab change — category, event type, location and search are all
  // applied client-side (see filteredEvents below) rather than as query
  // params, so filtering doesn't depend on the backend actually honoring
  // them correctly. Just pull a large enough batch once per tab to filter
  // against.
  useEffect(() => {
    if (discTab === 'upcoming') {
      dispatch(fetchEvents({ tab: 'upcoming', limit: 100 }));
    } else if (discTab === 'booked') {
      dispatch(fetchMyBooked());
    } else if (discTab === 'favorites') {
      dispatch(fetchMySaved());
    } else if (discTab === 'created') {
      dispatch(fetchMyCreated());
    }
  }, [discTab]); // eslint-disable-line

  // Sync savedIds from Redux (for heart animation state)
  useEffect(() => {
    const ids = new Set([
      ...rdxEvents.filter(e => e.isSaved).map(e => e.id),
      ...bookedEvents.filter(e => e.isSaved).map(e => e.id),
      ...savedEvents.map(e => e.id),
    ]);
    setSavedIds(ids);
  }, [rdxEvents, bookedEvents, savedEvents]);

  // Sync calendarIds from Redux — drives the "Add to Calendar"/"Added to
  // Calendar" label in the "..." menu.
  useEffect(() => {
    const ids = new Set([
      ...rdxEvents.filter(e => e.isInCalendar).map(e => e.id),
      ...bookedEvents.filter(e => e.isInCalendar).map(e => e.id),
      ...savedEvents.filter(e => e.isInCalendar).map(e => e.id),
      ...createdEvents.filter(e => e.isInCalendar).map(e => e.id),
      ...(eventDetail?.isInCalendar ? [eventDetail.id] : []),
    ]);
    setCalendarIds(ids);
  }, [rdxEvents, bookedEvents, savedEvents, createdEvents, eventDetail]);

  // Sync joinedIds from Redux's isAttending flag — without this, an event
  // the user already joined (in a previous session, or just fetched fresh)
  // had no way to show as joined until they clicked "+ Join" again in the
  // current session. Merged rather than replaced (unlike goingIds/savedIds
  // above): join/leave here call the API directly instead of through a
  // redux thunk, so isAttending on rdxEvents/bookedEvents/eventDetail only
  // refreshes once fetchEvents/fetchEventDetail re-run — merging preserves
  // the immediate local join/leave state in between.
  useEffect(() => {
    const attendingIds = [
      ...rdxEvents.filter(e => e.isAttending).map(e => e.id),
      ...bookedEvents.filter(e => e.isAttending).map(e => e.id),
      ...createdEvents.filter(e => e.isAttending).map(e => e.id),
      ...(eventDetail?.isAttending ? [eventDetail.id] : []),
    ];
    if (attendingIds.length === 0) return;
    setJoinedIds(prev => new Set([...prev, ...attendingIds]));
  }, [rdxEvents, bookedEvents, createdEvents, eventDetail]);

  // Join socket room + fetch detail when event selected
  useEffect(() => {
    if (!selectedEvent?.id) return;
    dispatch(fetchEventDetail(selectedEvent.id));
    joinEventRoom(selectedEvent.id);

    // Fetch attendee list to check if current user has joined
    apiRequest(`/api/events/${selectedEvent.id}/attendees`, { token: authToken })
      .then(data => {
        if (data && (Array.isArray(data.attendees) || data.totalAttending)) {
          const list = Array.isArray(data.attendees) ? data.attendees : [];
          setAttendeeCount(prev => ({ ...prev, [selectedEvent.id]: data.totalAttending || list.length || 0 }));
          setAttendeeList(prev => ({ ...prev, [selectedEvent.id]: list.map(normalizeAttendee) }));
        }
      })
      .catch(() => {}); // Silent fail, optional data

    const socket = window.socket;
    if (socket) {
      const handleUserJoined = (data) => {
        if (data.eventId === selectedEvent.id) {
          setAttendeeCount(prev => ({ ...prev, [selectedEvent.id]: data.totalAttending }));
        }
      };
      const handleUserLeft = (data) => {
        if (data.eventId === selectedEvent.id) {
          setAttendeeCount(prev => ({ ...prev, [selectedEvent.id]: data.totalAttending }));
        }
      };

      socket.on('event:user-joined', handleUserJoined);
      socket.on('event:user-left', handleUserLeft);

      return () => {
        socket.off('event:user-joined', handleUserJoined);
        socket.off('event:user-left', handleUserLeft);
        leaveEventRoom(selectedEvent.id);
      };
    }

    return () => { leaveEventRoom(selectedEvent.id); };
  }, [selectedEvent?.id]); // eslint-disable-line

  // "+ Join" no longer joins immediately — it opens the ticket → attendee
  // details flow below, and the actual join API call happens once that's
  // filled in (see submitJoinFlow).
  const handleJoinEvent = () => {
    if (!selectedEvent?.id) return;
    openJoinFlow(selectedEvent.id, selectedEvent.eventType);
  };

  // Loads this event's ticket tiers and opens the join modal on step 1 (or
  // straight to attendee details for a free event with no ticket tiers).
  // eventType ('online'|'offline'|'both') is shown alongside the tickets so
  // it's visible while picking one, not just on the event detail page.
  async function openJoinFlow(eventId, eventType) {
    if (!eventId) return;
    setJoinFlow({ eventId, eventType, step: 'ticket', tickets: [], ticketsLoading: true, ticketId: null, quantity: 1, members: [{ name: '', age: '' }], submitting: false });
    try {
      const data = await apiRequest(`/api/events/${eventId}/tickets`, { token: authToken });
      const tickets = Array.isArray(data) ? data : (data.tickets ?? []);
      setJoinFlow(prev => (prev && prev.eventId === eventId)
        ? { ...prev, tickets, ticketsLoading: false, step: tickets.length === 0 ? 'members' : 'ticket' }
        : prev);
    } catch (err) {
      setJoinFlow(null);
      dispatch(showToast({ message: err.message || 'Failed to load tickets.', type: 'error' }));
    }
  }

  function closeJoinFlow() { setJoinFlow(null); }

  function selectJoinTicket(ticket) {
    if (ticket.seatsAvailable === 0) return;
    setJoinFlow(prev => prev ? { ...prev, ticketId: ticket.id, step: 'members' } : prev);
  }

  // Clamped here (not just on the +/- buttons) so quantity can never exceed
  // the selected ticket's remaining seats no matter what calls this.
  function setJoinQuantity(qty) {
    setJoinFlow(prev => {
      if (!prev) return prev;
      const max = prev.tickets.find(t => t.id === prev.ticketId)?.seatsAvailable;
      const n = Math.max(1, max != null ? Math.min(qty, max) : qty);
      const members = Array.from({ length: n }, (_, i) => prev.members[i] ?? { name: '', age: '' });
      return { ...prev, quantity: n, members };
    });
  }

  function updateJoinMember(index, field, value) {
    setJoinFlow(prev => {
      if (!prev) return prev;
      const members = prev.members.map((m, i) => i === index ? { ...m, [field]: value } : m);
      return { ...prev, members };
    });
  }

  async function submitJoinFlow() {
    if (!joinFlow || joinFlow.submitting) return;
    const { eventId, ticketId, quantity, members } = joinFlow;
    setJoinFlow(prev => prev ? { ...prev, submitting: true } : prev);
    try {
      await apiRequest(`/api/events/${eventId}/join`, {
        method: 'POST',
        token: authToken,
        body: {
          ticketId,
          quantity,
          members: members.map(m => ({ name: m.name.trim(), age: Number(m.age) })),
        },
      });
      setJoinedIds(prev => new Set([...prev, eventId]));
      dispatch(showToast({ message: 'Joined event!', type: 'success' }));
      setJoinFlow(null);
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to join event.', type: 'error' }));
      setJoinFlow(prev => prev ? { ...prev, submitting: false } : prev);
    }
  }

  // ── Event discussion feed (posts, not flat comments) ──
  async function loadDiscussions(eventId, page) {
    setDiscussionsLoading(true);
    try {
      const data = await apiRequest(`/api/events/${eventId}/discussions?page=${page}&limit=10`, { token: authToken });
      const raw = data.discussions ?? data.data ?? (Array.isArray(data) ? data : []);
      const list = raw.map(normalizeDiscussion);
      setDiscussions(prev => (page === 1 ? list : [...prev, ...list]));
      setDiscussionsPage(page);
      setDiscussionsHasMore(!!data.hasMore || (typeof data.totalPages === 'number' && page < data.totalPages));
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to load discussions.', type: 'error' }));
    } finally {
      setDiscussionsLoading(false);
    }
  }

  function loadMoreDiscussions() {
    if (!selectedEvent?.id || discussionsLoading || !discussionsHasMore) return;
    loadDiscussions(selectedEvent.id, discussionsPage + 1);
  }

  function openDiscComposer() { setDiscComposerOpen(true); }

  function closeDiscComposer() {
    if (discPosting) return;
    setDiscComposerOpen(false);
    setDiscPostCaption('');
    discPostMedia.forEach(m => URL.revokeObjectURL(m.url));
    setDiscPostMedia([]);
    setDiscCropQueue([]);
    setDiscCropIndex(0);
  }

  // Images go through the same one-at-a-time crop flow the Create Event
  // cover photo upload uses; videos aren't croppable so they attach directly.
  function handleDiscMediaPick(e) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const images = files.filter(f => f.type.startsWith('image'));
    const videos = files.filter(f => f.type.startsWith('video'));
    if (images.length > 0) setDiscCropQueue(prev => [...prev, ...images]);
    if (videos.length > 0) {
      setDiscPostMedia(prev => [...prev, ...videos.map(file => ({ file, url: URL.createObjectURL(file), type: 'video' }))]);
    }
    e.target.value = '';
  }

  function advanceDiscCropQueue() {
    if (discCropIndex + 1 >= discCropQueue.length) {
      setDiscCropQueue([]);
      setDiscCropIndex(0);
    } else {
      setDiscCropIndex(i => i + 1);
    }
  }

  function handleDiscCropSave(croppedFile) {
    setDiscPostMedia(prev => [...prev, { file: croppedFile, url: URL.createObjectURL(croppedFile), type: 'image' }]);
    advanceDiscCropQueue();
  }

  function handleDiscCropSkip() {
    const original = discCropQueue[discCropIndex];
    setDiscPostMedia(prev => [...prev, { file: original, url: URL.createObjectURL(original), type: 'image' }]);
    advanceDiscCropQueue();
  }

  function handleDiscCropCancelAll() {
    setDiscCropQueue([]);
    setDiscCropIndex(0);
  }

  function removeDiscMedia(idx) {
    setDiscPostMedia(prev => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handlePostDiscussion() {
    if (!selectedEvent?.id || discPosting) return;
    if (!discPostCaption.trim() && discPostMedia.length === 0) return;
    setDiscPosting(true);
    try {
      const fd = new FormData();
      if (discPostCaption.trim()) fd.append('caption', discPostCaption.trim());
      discPostMedia.forEach(m => fd.append('media', m.file));
      const data = await apiRequest(`/api/events/${selectedEvent.id}/discussions`, {
        method: 'POST', token: authToken, body: fd, isFormData: true,
      });
      const post = normalizeDiscussion(data.discussion ?? data);
      setDiscussions(prev => [post, ...prev]);
      setDiscPostCaption('');
      discPostMedia.forEach(m => URL.revokeObjectURL(m.url));
      setDiscPostMedia([]);
      setDiscComposerOpen(false);
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to post.', type: 'error' }));
    } finally {
      setDiscPosting(false);
    }
  }

  async function handleLikeDiscussion(discussionId) {
    if (!selectedEvent?.id) return;
    // Optimistic toggle — calling this same updater again on failure flips it right back.
    const toggle = prev => prev.map(d => d.id === discussionId
      ? { ...d, likedByMe: !d.likedByMe, likeCount: d.likeCount + (d.likedByMe ? -1 : 1) }
      : d);
    setDiscussions(toggle);
    try {
      await apiRequest(`/api/events/${selectedEvent.id}/discussions/${discussionId}/like`, { method: 'POST', token: authToken });
    } catch (err) {
      setDiscussions(toggle);
      dispatch(showToast({ message: err.message || 'Failed to like post.', type: 'error' }));
    }
  }

  function toggleDiscExpanded(discussionId) {
    setDiscExpandedId(prev => (prev === discussionId ? null : discussionId));
    setDiscReplyTarget(null);
  }

  async function handlePostDiscComment(discussionId) {
    if (!selectedEvent?.id || discCommentBusy) return;
    const text = (discCommentText[discussionId] || '').trim();
    if (!text) return;
    setDiscCommentBusy(true);
    try {
      const data = await apiRequest(`/api/events/${selectedEvent.id}/discussions/${discussionId}/comments`, {
        method: 'POST', token: authToken, body: { text },
      });
      const c = normalizeDiscComment(data.comment ?? data);
      setDiscussions(prev => prev.map(d => d.id === discussionId
        ? { ...d, comments: [...d.comments, c], commentCount: d.commentCount + 1 }
        : d));
      setDiscCommentText(prev => ({ ...prev, [discussionId]: '' }));
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to comment.', type: 'error' }));
    } finally {
      setDiscCommentBusy(false);
    }
  }

  async function handleLikeDiscComment(discussionId, commentId) {
    if (!selectedEvent?.id) return;
    const toggle = prev => prev.map(d => d.id !== discussionId ? d : {
      ...d,
      comments: d.comments.map(c => c.id !== commentId ? c : { ...c, likedByMe: !c.likedByMe, likeCount: c.likeCount + (c.likedByMe ? -1 : 1) }),
    });
    setDiscussions(toggle);
    try {
      await apiRequest(`/api/events/${selectedEvent.id}/discussions/${discussionId}/comments/${commentId}/like`, { method: 'POST', token: authToken });
    } catch (err) {
      setDiscussions(toggle);
      dispatch(showToast({ message: err.message || 'Failed to like comment.', type: 'error' }));
    }
  }

  function openDiscReply(discussionId, commentId) {
    setDiscReplyTarget(prev => (prev?.discussionId === discussionId && prev?.commentId === commentId)
      ? null
      : { discussionId, commentId });
    setDiscReplyText('');
  }

  async function handleSendDiscReply() {
    if (!selectedEvent?.id || !discReplyTarget || discReplyBusy) return;
    const text = discReplyText.trim();
    if (!text) return;
    const { discussionId, commentId } = discReplyTarget;
    setDiscReplyBusy(true);
    try {
      const data = await apiRequest(`/api/events/${selectedEvent.id}/discussions/${discussionId}/comments/${commentId}/replies`, {
        method: 'POST', token: authToken, body: { text },
      });
      const r = normalizeDiscReply(data.reply ?? data);
      setDiscussions(prev => prev.map(d => d.id !== discussionId ? d : {
        ...d,
        comments: d.comments.map(c => c.id !== commentId ? c : { ...c, replies: [...c.replies, r] }),
      }));
      setDiscReplyTarget(null);
      setDiscReplyText('');
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to reply.', type: 'error' }));
    } finally {
      setDiscReplyBusy(false);
    }
  }

  async function handleLikeDiscReply(discussionId, commentId, replyId) {
    if (!selectedEvent?.id) return;
    const toggle = prev => prev.map(d => d.id !== discussionId ? d : {
      ...d,
      comments: d.comments.map(c => c.id !== commentId ? c : {
        ...c,
        replies: c.replies.map(r => r.id !== replyId ? r : { ...r, likedByMe: !r.likedByMe, likeCount: r.likeCount + (r.likedByMe ? -1 : 1) }),
      }),
    });
    setDiscussions(toggle);
    try {
      await apiRequest(`/api/events/${selectedEvent.id}/discussions/${discussionId}/comments/${commentId}/replies/${replyId}/like`, { method: 'POST', token: authToken });
    } catch (err) {
      setDiscussions(toggle);
      dispatch(showToast({ message: err.message || 'Failed to like reply.', type: 'error' }));
    }
  }

  const handleLeaveEvent = async () => {
    if (!selectedEvent?.id || joiningId === selectedEvent.id) return;
    setJoiningId(selectedEvent.id);
    try {
      await apiRequest(`/api/events/${selectedEvent.id}/leave`, { method: 'POST', token: authToken });
      setJoinedIds(prev => {
        const n = new Set(prev);
        n.delete(selectedEvent.id);
        return n;
      });
      dispatch(showToast({ message: 'Left event.', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to leave event.', type: 'error' }));
    } finally {
      setJoiningId(null);
    }
  };

  const handleJoinEventCard = (eventId, eventType) => {
    openJoinFlow(eventId, eventType);
  };

  const handleInviteFriend = async (friendId) => {
    if (!friendId || invitingFriendIds.has(friendId)) return;
    setInvitingFriendIds(prev => new Set([...prev, friendId]));
    try {
      await apiRequest(`/api/events/${editingEventId || form.id}/invites`, {
        method: 'POST',
        token: authToken,
        body: { friendId },
      });
      setInvitedFriendIds(prev => new Set([...prev, friendId]));
      dispatch(showToast({ message: 'Invitation sent!', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to send invitation.', type: 'error' }));
    } finally {
      setInvitingFriendIds(prev => {
        const n = new Set(prev);
        n.delete(friendId);
        return n;
      });
    }
  };

  // Per-platform share buttons now live in the ShareSheet modal (see
  // shareOpen below) — this just handles the more-menu's "copy link" row.
  function handleCopyEventLink() {
    const eventId = selectedEvent?.id || editingEventId;
    navigator.clipboard.writeText(eventPermalink(eventId));
    dispatch(showToast({ message: 'Event link copied!', type: 'success' }));
  }

  const EVENT_REPORT_REASONS = [
    'Sexual content',
    'Violent or repulsive content',
    'Hateful or abusive content',
    'Harassment or bullying',
    'Harmful or dangerous acts',
    'Suicide, self-harm or eating disorders',
    'Misinformation',
    'Child abuse',
    'Promotes terrorism',
    'Spam or misleading',
    'Legal issue',
  ];

  function closeReportModal() {
    setReportOpen(false);
    setReportReason('');
    setReportDone(false);
  }

  async function submitReportEvent() {
    if (!reportReason || !selectedEvent?.id || reportSubmitting) return;
    setReportSubmitting(true);
    const result = await dispatch(reportEvent({ eventId: selectedEvent.id, reason: reportReason }));
    setReportSubmitting(false);
    if (reportEvent.fulfilled.match(result)) {
      setReportDone(true);
    } else {
      dispatch(showToast({ message: result.payload || 'Failed to submit report.', type: 'error' }));
    }
  }

  // Load the discussion feed (page 1) when the tab opens.
  useEffect(() => {
    if (evDetailTab === 'discussion' && selectedEvent?.id) {
      setDiscExpandedId(null);
      loadDiscussions(selectedEvent.id, 1);
    }
  }, [evDetailTab, selectedEvent?.id]); // eslint-disable-line

  // If the user leaves the event while looking at the discussion (the "+
  // Join"/"Leave event" toggle), don't strand them on a tab they can no
  // longer access — drop back to About.
  useEffect(() => {
    if (evDetailTab === 'discussion' && selectedEvent && !canViewDiscussion) {
      setEvDetailTab('about');
    }
  }, [canViewDiscussion]); // eslint-disable-line

  // Real-time: new discussion posts from other attendees appear live while
  // the tab is open, instead of only showing up on the next fetch. Likes/
  // comments/replies aren't reconciled live here — their socket payload
  // shapes weren't pinned down, and guessing wrong risks double-counting.
  useEffect(() => {
    if (evDetailTab !== 'discussion' || !selectedEvent?.id) return;
    const socket = window.socket;
    if (!socket) return;
    const handleCreated = (data) => {
      const eventId = data?.eventId;
      const raw = data?.discussion ?? data;
      if (eventId !== selectedEvent.id || !raw) return;
      const post = normalizeDiscussion(raw);
      if (!post.id) return;
      setDiscussions(prev => prev.some(d => d.id === post.id) ? prev : [post, ...prev]);
    };
    socket.on('discussion:created', handleCreated);
    return () => socket.off('discussion:created', handleCreated);
  }, [evDetailTab, selectedEvent?.id]);

  function handleCoverChange(e) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setCoverCropQueue(files);
    setCoverCropIndex(0);
    e.target.value = '';
  }

  function advanceCoverCropQueue() {
    if (coverCropIndex + 1 >= coverCropQueue.length) {
      setCoverCropQueue([]);
      setCoverCropIndex(0);
    } else {
      setCoverCropIndex(i => i + 1);
    }
  }

  function handleCoverCropSave(croppedFile) {
    setCoverImages(prev => [...prev, { id: `${Date.now()}-${prev.length}`, file: croppedFile, url: URL.createObjectURL(croppedFile) }]);
    advanceCoverCropQueue();
  }

  function handleCoverCropSkip() {
    const original = coverCropQueue[coverCropIndex];
    setCoverImages(prev => [...prev, { id: `${Date.now()}-${prev.length}`, file: original, url: URL.createObjectURL(original) }]);
    advanceCoverCropQueue();
  }

  function handleCoverCropCancelAll() {
    setCoverCropQueue([]);
    setCoverCropIndex(0);
  }

  function removeCoverImage(id) {
    setCoverImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter(img => img.id !== id);
    });
  }

  function removeExistingCoverImage(url) {
    setExistingCoverImages(prev => prev.filter(u => u !== url));
  }

  async function handlePublish(asDraft = false) {
    // Required field validation
    const publishErrors = [];
    if (!form.title.trim())    publishErrors.push('Event title is required.');
    if (!form.category)        publishErrors.push('Event category is required.');
    if (form.category === 'Other' && !form.categoryOther.trim()) publishErrors.push('Please enter a custom category.');
    if (!form.eventType)       publishErrors.push('Event type (online / offline / both) is required.');
    if (!form.startDate)       publishErrors.push('Start date is required.');
    // 'both' events need a venue AND a meeting link — the location tab is just
    // which section is currently in view, not which data actually gets submitted
    // (both venue and virtual state persist regardless of the active tab).
    const needsVenue  = form.eventType === 'offline' || form.eventType === 'both';
    const needsVirtual = form.eventType === 'online' || form.eventType === 'both';
    const venueIncomplete = needsVenue && (!venue.name.trim() || !venue.street.trim() || !venue.city.trim() || !venue.state.trim());
    const organizerIncomplete = needsVenue && (!organizer.fullName.trim() || !organizer.phone.trim());
    const virtualIncomplete = needsVirtual && !hasMeaningfulLink(virtual.link);
    if (venueIncomplete) {
      publishErrors.push('Venue name, street address, city and state are required for offline events.');
    }
    if (organizerIncomplete) {
      publishErrors.push('Organizer name and phone number are required.');
    }
    if (virtualIncomplete) {
      publishErrors.push('Meeting link is required for online events.');
    }
    if (publishErrors.length > 0) {
      dispatch(showToast({ message: publishErrors[0], type: 'error' }));
      // Jump to the step that has the first error
      if (!form.title.trim() || !form.category || !form.eventType || !form.startDate) setStep(1);
      else if (venueIncomplete || organizerIncomplete || virtualIncomplete) {
        setStep(3);
        // "Both" events split step 3 into Physical/Online tabs — surface
        // whichever half is actually missing instead of leaving the user on
        // a tab that already looks complete.
        if (venueIncomplete || organizerIncomplete) setLocationTab('physical');
        else if (virtualIncomplete) setLocationTab('online');
      }
      return;
    }

    const fd = new FormData();
    fd.append('title', capitalizeFirst(form.title.trim()));
    if (form.tagline) fd.append('tagline', form.tagline);
    if (form.description) {
      const descCapitalized = capitalizeFirst(form.description);
      fd.append('description', descCapitalized);
      fd.append('about', descCapitalized);
    }
    // Backend keeps category === 'Other' literal and stores the typed value
    // separately as customCategory (auto-cleared server-side when category
    // isn't 'Other'), so send both rather than substituting one for the other.
    fd.append('category', form.category);
    if (form.category === 'Other') fd.append('customCategory', form.categoryOther.trim());
    fd.append('eventType', form.eventType);
    fd.append('visibility', form.visibility);
    fd.append('pricingType', pricingType);
    fd.append('status', asDraft ? 'draft' : 'published');
    fd.append('startDate', form.startDate);
    if (form.endDate) fd.append('endDate', form.endDate);
    fd.append('isAllDay', form.isAllDay ? 'true' : 'false');
    if (!form.isAllDay) {
      if (form.startTime) fd.append('startTime', form.startTime);
      if (form.endTime)   fd.append('endTime',   form.endTime);
    }
    // On a plain create, new files are all there is. On an edit, the images
    // already on the event only exist as remote URLs (no File to resend) — a
    // PUT that omits them entirely risks the backend treating "no coverImage
    // in this request" as "this event now has zero images" and wiping them.
    // Since there's no confirmed "keep these existing images" field the
    // backend understands, the robust fix is to re-download every remaining
    // existing image and resend it as a real file alongside the new ones, so
    // every edit always carries the FULL current image set as actual uploads.
    if (editingEventId && existingCoverImages.length > 0) {
      setPreparingImages(true);
      const refetched = await Promise.all(existingCoverImages.map(async (url, i) => {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          const ext = (blob.type.split('/')[1] || 'jpg').split('+')[0];
          return new File([blob], `cover-${i}.${ext}`, { type: blob.type || 'image/jpeg' });
        } catch {
          return null; // couldn't re-fetch (CORS/network) — dropped rather than blocking the save
        }
      }));
      refetched.filter(Boolean).forEach(file => fd.append('coverImage', file));
      setPreparingImages(false);
    }
    coverImages.forEach(img => fd.append('coverImage', img.file));
    if (form.eventType === 'offline' || form.eventType === 'both') {
      // Field name is 'venue' (not 'location'), and the venue's own name is
      // the 'name' key (not 'venue') — matches the backend's confirmed shape.
      fd.append('venue', JSON.stringify({ name: venue.name, street: venue.street, city: venue.city, state: venue.state, country: venue.country, pinCode: venue.pinCode }));
      if (parking) fd.append('parking', parking);
      fd.append('organizer', JSON.stringify(organizer));
    }
    if (form.eventType === 'online' || form.eventType === 'both') {
      if (virtual.link)         fd.append('virtualLink', virtual.link);
      if (virtual.instructions) fd.append('virtualInstructions', virtual.instructions);
    }
    // `tickets` keeps its default (or last-edited) paid tiers in state even
    // after switching pricingType to 'free' — that only hides the ticket
    // editor, it doesn't clear the array. Gate on pricingType instead of
    // tickets.length so a "Free" event never sends paid tiers, and send an
    // explicit empty array (not just omit the field) so editing a paid
    // event down to Free also clears any tiers already saved server-side.
    fd.append('tickets', JSON.stringify(
      pricingType === 'paid'
        ? tickets.map(t => ({
            name: t.name, description: t.description ?? '', price: parseFloat(t.price) || 0,
            seats: parseInt(t.seats) || 0, maxPerUser: parseInt(t.maxPerUser) || 1, iconType: t.iconType,
          }))
        : []
    ));
    fd.append('registration', JSON.stringify({
      ticketPrice: parseFloat(registration.ticketPrice) || 0,
      totalSeats:  parseInt(registration.totalSeats) || 0,
      maxPerUser:  parseInt(registration.maxPerUser) || 4,
      deadline:    registration.deadline,
    }));

    const action = editingEventId
      ? updateEvent({ eventId: editingEventId, formData: fd })
      : createEvent(fd);

    dispatch(action).then(result => {
      const succeeded = editingEventId ? updateEvent.fulfilled.match(result) : createEvent.fulfilled.match(result);
      const failed    = editingEventId ? updateEvent.rejected.match(result)  : createEvent.rejected.match(result);
      if (succeeded) {
        const message = editingEventId
          ? 'Event updated successfully!'
          : (asDraft ? 'Event saved as draft.' : 'Event published successfully!');
        dispatch(showToast({ message, type: 'success' }));
        setShowCreate(false);
        setStep(1);
        // Refresh every list the new/edited event could now appear in — a
        // published event lands in both "My Created" and the public
        // "Upcoming" feed, so both need fresh data, not just the one the
        // create form happened to be opened from.
        dispatch(fetchMyCreated());
        dispatch(fetchEvents({ tab: 'upcoming', limit: 100 }));
        dispatch(fetchMyBooked());
      } else if (createEvent.rejected.match(action)) {
        dispatch(showToast({ message: action.payload ?? 'Failed to publish event.', type: 'error' }));
      }
    }).finally(() => setDraftLoading(false));
  }

  function toggleSave(id) {
    const wasSaved = savedIds.has(id);
    setSavedIds(p => {
      const n = new Set(p);
      const adding = !n.has(id);
      adding ? n.add(id) : n.delete(id);
      if (adding) {
        setHeartingIds(h => { const nh = new Set(h); nh.add(id); return nh; });
        setHeartParticles(prev => ({ ...prev, [id]: HEART_BURST_PATHS.map((bp, i) => ({ id: Date.now() + i, ...bp })) }));
        setTimeout(() => {
          setHeartingIds(h => { const nh = new Set(h); nh.delete(id); return nh; });
          setHeartParticles(prev => { const next = { ...prev }; delete next[id]; return next; });
        }, 700);
      }
      return n;
    });
    if (wasSaved) dispatch(unsaveEvent(id));
    else dispatch(saveEvent(id));
  }

  // Awaits the actual API result before declaring success — this used to
  // fire an optimistic "Added to your calendar!" toast unconditionally, so
  // a failed request (backend error, stale auth, etc.) still told the user
  // it worked while nothing was actually saved, with no way to tell why
  // "My Calendar" later came up empty.
  async function toggleCalendar(id) {
    const wasIn = calendarIds.has(id);
    setCalendarIds(p => { const n = new Set(p); wasIn ? n.delete(id) : n.add(id); return n; });
    const action = wasIn ? uncalendarEvent : calendarEvent;
    const result = await dispatch(action(id));
    if (action.fulfilled.match(result)) {
      dispatch(showToast({ message: wasIn ? 'Removed from your calendar.' : 'Added to your calendar!', type: 'success' }));
    } else {
      // Revert the optimistic toggle — the request didn't actually succeed.
      setCalendarIds(p => { const n = new Set(p); wasIn ? n.add(id) : n.delete(id); return n; });
      dispatch(showToast({ message: result.payload || 'Failed to update your calendar.', type: 'error' }));
    }
  }

  // Creator-only manual "Sold Out" toggle — independent of the join flow's
  // ticket/seat counts, so an organizer selling seats outside the app can
  // still cut off new Joins once they're really gone.
  function handleToggleSoldOut(ev) {
    const next = !ev.soldOut;
    dispatch(setEventSoldOut({ eventId: ev.id, soldOut: next })).then(result => {
      if (setEventSoldOut.fulfilled.match(result)) {
        dispatch(showToast({ message: next ? 'Event marked as sold out.' : 'Event marked as available again.', type: 'success' }));
      } else {
        dispatch(showToast({ message: result.payload || 'Failed to update.', type: 'error' }));
      }
    });
  }

  async function handlePublishDraft(eventId) {
    const result = await dispatch(publishEvent(eventId));
    if (publishEvent.fulfilled.match(result)) {
      dispatch(showToast({ message: 'Event published successfully!', type: 'success' }));
      setCreatedTab('published');
      // Re-pull both lists: the draft was never in the public feed, so the
      // optimistic status patch can't put it there — only a refetch can.
      dispatch(fetchMyCreated());
      dispatch(fetchEvents({ tab: 'upcoming', limit: 100 }));
    } else {
      dispatch(showToast({ message: result.payload ?? 'Failed to publish event', type: 'error' }));
    }
  }

  // Step 1 state
  const [form, setForm] = useState(EMPTY_EVENT_FORM);

  // Visibility dropdown (same chip + option-list pattern as post create's audience picker)
  const [visDropdownOpen, setVisDropdownOpen] = useState(false);
  const visDropdownRef = useRef(null);

  useEffect(() => {
    function onOutsideClick(e) {
      if (visDropdownRef.current && !visDropdownRef.current.contains(e.target)) {
        setVisDropdownOpen(false);
      }
    }
    if (visDropdownOpen) document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [visDropdownOpen]);

  // Event Category dropdown — custom (icon-free) version of the same
  // trigger-button + floating-option-list pattern used for Visibility above.
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const catDropdownRef = useRef(null);

  useEffect(() => {
    function onOutsideClick(e) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setCatDropdownOpen(false);
      }
    }
    if (catDropdownOpen) document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [catDropdownOpen]);

  // Step 2 state
  const [pricingType, setPricingType] = useState('paid');
  const [tickets, setTickets] = useState(() => DEFAULT_TICKETS.map(t => ({ ...t })));
  const [selectedTicketId, setSelectedTicketId] = useState('1');
  const [showNewForm, setShowNewForm] = useState(true);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [newTicket, setNewTicket] = useState(EMPTY_NEW_TICKET);
  // Guards against silently losing an in-progress (unsaved) ticket draft when
  // switching to add/edit a different one — see requestTicketFormSwitch below.
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [pendingTicketAction, setPendingTicketAction] = useState(null);
  const [registration, setRegistration] = useState(DEFAULT_REGISTRATION);

  // Step 3 state
  const [locationTab, setLocationTab] = useState('physical');
  const [venue, setVenue] = useState(EMPTY_VENUE);
  const [parking, setParking] = useState('');
  const [organizer, setOrganizer] = useState(EMPTY_ORGANIZER);
  const [virtual, setVirtual] = useState(DEFAULT_VIRTUAL);
  const instructionsRef = useRef(null);

  // Clear every step of the create wizard back to its defaults. Without this
  // the state survives after a save, so reopening "Create Event" shows the
  // previously created event's details instead of a blank form.
  function resetWizard() {
    setForm(EMPTY_EVENT_FORM);
    setCoverImages([]);
    setCoverCropQueue([]);
    setCoverCropIndex(0);
    setPricingType('paid');
    setTickets(DEFAULT_TICKETS.map(t => ({ ...t })));
    setSelectedTicketId('1');
    setShowNewForm(true);
    setEditingTicketId(null);
    setNewTicket(EMPTY_NEW_TICKET);
    setRegistration(DEFAULT_REGISTRATION);
    setLocationTab('physical');
    setVenue(EMPTY_VENUE);
    setParking('');
    setOrganizer(EMPTY_ORGANIZER);
    setVirtual(DEFAULT_VIRTUAL);
    setStep(1);
  }

  // Instructions field auto-formats as a bullet list: the first character
  // typed seeds a bullet, and every Enter press starts a fresh bulleted line
  // (instead of a single-line input with no structure).
  function handleInstructionsFocus() {
    if (virtual.instructions) return;
    setVirtual(p => ({ ...p, instructions: '• ' }));
    requestAnimationFrame(() => {
      if (instructionsRef.current) instructionsRef.current.setSelectionRange(2, 2);
    });
  }

  function handleInstructionsKeyDown(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const ta = e.target;
    const { selectionStart, selectionEnd, value } = ta;
    const insertion = '\n• ';
    const nextValue = value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);
    const nextCursor = selectionStart + insertion.length;
    setVirtual(p => ({ ...p, instructions: nextValue }));
    requestAnimationFrame(() => {
      if (instructionsRef.current) instructionsRef.current.setSelectionRange(nextCursor, nextCursor);
    });
  }

  // Wipes every Step 1-3 field back to its blank starting point — called after
  // a successful create/draft save so re-opening "Create Event" starts fresh
  // instead of showing the previous event's leftover title, tickets, venue, etc.
  function resetCreateForm() {
    setForm(EMPTY_EVENT_FORM);
    coverImages.forEach(img => URL.revokeObjectURL(img.url));
    setCoverImages([]);
    setCoverCropQueue([]);
    setCoverCropIndex(0);
    setExistingCoverImages([]);
    setEditingEventId(null);
    setPricingType('paid');
    setTickets([
      { id: '1', name: 'VIP Access',         price: '150', seats: '50',  iconType: 'star'   },
      { id: '2', name: 'General Admission',  price: '45',  seats: '150', iconType: 'ticket' },
      { id: '3', name: 'Early Bird',         price: '30',  seats: '100', iconType: 'clock'  },
    ]);
    setSelectedTicketId('1');
    setShowNewForm(true);
    setEditingTicketId(null);
    setNewTicket({ name: '', description: '', price: '0.00', seats: '100', maxPerUser: '1' });
    setRegistration({ ticketPrice: '150', totalSeats: '', maxPerUser: '4', deadline: '' });
    setLocationTab('physical');
    setVenue({ name: '', street: '', city: '', state: '', country: '', pinCode: '' });
    setParking('');
    setOrganizer({ fullName: '', email: '', phone: '' });
    setVirtual({ link: 'https://', instructions: '' });
    setDateErrors({ startDate: '', endDate: '', endTime: '' });
    setStepErrors({});
  }

  // Loads an existing event's data into the same Step 1-3 state the create
  // form uses, then opens that form in "edit" mode (handlePublish switches to
  // PUT once editingEventId is set). This is the flow that was entirely
  // missing before — "Edit Event" was previously just a decorative button.
  function openEditEvent(ev) {
    resetCreateForm();
    setEditingEventId(ev.id);
    setForm({
      title: ev.title || '',
      tagline: ev.tagline || '',
      description: ev.desc || '',
      startDate: ev.startDate || '',
      endDate: ev.endDate || '',
      startTime: ev.startTime || '',
      endTime: ev.endTime || '',
      isAllDay: !!ev.isAllDay,
      category: ev.category || '',
      categoryOther: ev.category === 'Other' ? (ev.customCategory || '') : '',
      eventType: ev.eventType || 'offline',
      visibility: ev.visibility || 'anyone',
    });
    setExistingCoverImages(ev.coverImages ?? []);
    const evTickets = ev.tickets ?? [];
    setPricingType(evTickets.length > 0 ? 'paid' : 'free');
    if (evTickets.length > 0) {
      setTickets(evTickets.map((t, i) => ({
        id: t.id ?? t._id ?? String(i + 1),
        name: t.name ?? '',
        description: t.description ?? '',
        price: String(t.price ?? '0'),
        seats: String(t.seats ?? '0'),
        maxPerUser: String(t.maxPerUser ?? '1'),
        iconType: t.iconType ?? 'ticket',
      })));
      setSelectedTicketId(evTickets[0]?.id ?? evTickets[0]?._id ?? '1');
    } else {
      setTickets([]);
      setSelectedTicketId(null);
    }
    setShowNewForm(false);
    if (ev.registration) {
      setRegistration({
        ticketPrice: String(ev.registration.ticketPrice ?? '150'),
        totalSeats:  String(ev.registration.totalSeats ?? ''),
        maxPerUser:  String(ev.registration.maxPerUser ?? '4'),
        deadline:    ev.registration.deadline ?? '',
      });
    }
    setLocationTab(ev.eventType === 'online' ? 'online' : 'physical');
    if (ev.venueObj) {
      setVenue({
        name: ev.venueObj.name ?? '',
        street: ev.venueObj.street ?? '',
        city: ev.venueObj.city ?? '',
        state: ev.venueObj.state ?? '',
        country: ev.venueObj.country ?? '',
        pinCode: ev.venueObj.pinCode ?? '',
      });
    }
    setParking(ev.parking ?? '');
    if (ev.organizer) {
      setOrganizer({
        fullName: ev.organizer.fullName ?? '',
        email: ev.organizer.email ?? '',
        phone: ev.organizer.phone ?? '',
      });
    }
    setVirtual({
      link: ev.virtualLink || 'https://',
      instructions: ev.virtualInstructions ?? '',
    });
    setStep(1);
    setShowCreate(true);
    setSelectedEvent(null);
    setMoreOpen(false);
  }

  // Step 3's location tab defaults to whichever option matches Step 1's Event
  // Type — Online → "Online Event" tab, Offline → "Physical Event" tab —
  // instead of always opening on Physical regardless of that choice.
  useEffect(() => {
    setLocationTab(form.eventType === 'online' ? 'online' : 'physical');
  }, [form.eventType]);

  const [dateErrors, setDateErrors] = useState({ startDate: '', endDate: '', endTime: '' });
  const [stepErrors, setStepErrors] = useState({});
  const todayStr = new Date().toISOString().split('T')[0];
  const MIN_EVENT_MINUTES = 60;

  function timeDiffMinutes(st, et) {
    const [sh, sm] = st.split(':').map(Number);
    const [eh, em] = et.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }

  function computeEndTimeError(st, et, sameDay) {
    if (!sameDay || !st || !et) return '';
    const diff = timeDiffMinutes(st, et);
    if (diff < 0) return 'End time cannot be before start time';
    if (diff < MIN_EVENT_MINUTES) return 'End time must be at least 1 hour after start time';
    return '';
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    let next = type === 'checkbox' ? checked : value;
    if ((name === 'title' || name === 'description') && typeof next === 'string') {
      next = capitalizeFirst(next);
    }
    setForm(prev => {
      const updated = { ...prev, [name]: next };
      const errors = { ...dateErrors };
      if (name === 'startDate') {
        errors.startDate = next && next < todayStr ? 'Start date cannot be in the past' : '';
        const ed = updated.endDate;
        errors.endDate = ed && next && ed < next ? 'End date cannot be before start date' : '';
        errors.endTime = computeEndTimeError(updated.startTime, updated.endTime, next === updated.endDate);
      }
      if (name === 'endDate') {
        const sd = updated.startDate;
        errors.endDate = next && sd && next < sd ? 'End date cannot be before start date' : '';
        errors.endTime = computeEndTimeError(updated.startTime, updated.endTime, updated.startDate === next);
      }
      if (name === 'startTime' || name === 'endTime') {
        const st = name === 'startTime' ? next : updated.startTime;
        const et = name === 'endTime'   ? next : updated.endTime;
        const sameDay = updated.startDate && updated.endDate && updated.startDate === updated.endDate;
        errors.endTime = computeEndTimeError(st, et, sameDay);
      }
      setDateErrors(errors);
      return updated;
    });
  }

  function handleNewTicketChange(e) {
    const { name, value } = e.target;
    if ((name === 'price' || name === 'seats') && value !== '' && parseFloat(value) < 0) return;
    setNewTicket(prev => ({ ...prev, [name]: value }));
  }

  function handleRegistrationChange(e) {
    const { name, value } = e.target;
    setRegistration(prev => ({ ...prev, [name]: value }));
  }

  function saveNewTicket() {
    if (!newTicket.name.trim()) return;
    if (editingTicketId) {
      setTickets(prev => prev.map(t => t.id === editingTicketId ? { ...t, ...newTicket } : t));
      setEditingTicketId(null);
    } else {
      setTickets(prev => [...prev, { id: Date.now().toString(), ...newTicket, iconType: 'ticket' }]);
    }
    setNewTicket({ name: '', description: '', price: '0.00', seats: '100', maxPerUser: '1' });
    setShowNewForm(false);
  }

  function startEditTicket(tk) {
    setEditingTicketId(tk.id);
    setNewTicket({
      name: tk.name ?? '',
      description: tk.description ?? '',
      price: tk.price ?? '0.00',
      seats: tk.seats ?? '100',
      maxPerUser: tk.maxPerUser ?? '1',
    });
    setShowNewForm(true);
  }

  function cancelTicketForm() {
    setShowNewForm(false);
    setEditingTicketId(null);
    setNewTicket({ name: '', description: '', price: '0.00', seats: '100', maxPerUser: '1' });
  }

  function removeTicket(id) {
    setTickets(prev => prev.filter(t => t.id !== id));
    setSelectedTicketId(prev => (prev === id ? null : prev));
    if (editingTicketId === id) cancelTicketForm();
  }

  function hasUnsavedTicketDraft() {
    return showNewForm && newTicket.name.trim().length > 0;
  }

  // Routes any "open a different ticket form" action (add new / edit another)
  // through an unsaved-draft check first, so a typed-but-unsaved ticket name
  // never silently disappears.
  function requestTicketFormSwitch(action) {
    if (hasUnsavedTicketDraft()) {
      setPendingTicketAction(() => action);
      setDiscardConfirmOpen(true);
    } else {
      action();
    }
  }

  function openBlankTicketForm() {
    setEditingTicketId(null);
    setNewTicket({ name: '', description: '', price: '0.00', seats: '100', maxPerUser: '1' });
    setShowNewForm(true);
  }

  function confirmDiscardTicketDraft() {
    setDiscardConfirmOpen(false);
    if (pendingTicketAction) pendingTicketAction();
    setPendingTicketAction(null);
  }

  function cancelDiscardTicketDraft() {
    setDiscardConfirmOpen(false);
    setPendingTicketAction(null);
  }

  function handleBack() {
    setStepErrors({});
    setAnimDir('back');
    if (step === 1) { setShowCreate(false); setStep(1); resetCreateForm(); }
    else setStep(s => s - 1);
  }

  function validateStep(s) {
    const errs = {};
    if (s === 1) {
      if (!form.title.trim())  errs.title     = 'Event title is required.';
      if (!form.category)      errs.category  = 'Please select a category.';
      else if (form.category === 'Other' && !form.categoryOther.trim()) errs.category = 'Please enter a custom category.';
      if (!form.startDate)     errs.startDate = 'Start date is required.';
      if (dateErrors.startDate) errs.startDate = dateErrors.startDate;
      if (dateErrors.endDate)   errs.endDate   = dateErrors.endDate;
      if (dateErrors.endTime)   errs.endTime   = dateErrors.endTime;
    }
    if (s === 2) {
      if (pricingType === 'paid' && tickets.length === 0) {
        errs.tickets = 'Add at least one ticket type for a paid event.';
      }
      if (pricingType === 'paid' && tickets.some(t => !t.name.trim())) {
        errs.tickets = 'All ticket types must have a name.';
      }
      if (pricingType === 'paid' && tickets.some(t => parseFloat(t.price) < 0)) {
        errs.tickets = 'Ticket price cannot be negative.';
      }
      if (pricingType === 'paid' && tickets.some(t => parseFloat(t.seats) < 0)) {
        errs.tickets = 'Total seats cannot be negative.';
      }
    }
    if (s === 3) {
      if (form.eventType === 'offline' || form.eventType === 'both') {
        if (!venue.name.trim())   errs.venueName = 'Venue name is required for offline events.';
        if (!venue.street.trim()) errs.street     = 'Street address is required for offline events.';
        if (!venue.city.trim())   errs.city       = 'City is required for offline events.';
        if (!venue.state.trim())  errs.state      = 'State / Province is required for offline events.';
        if (!organizer.fullName.trim()) errs.organizerName  = 'Organizer name is required.';
        if (!organizer.phone.trim())    errs.organizerPhone = 'Organizer phone number is required.';
      }
      if (form.eventType === 'online' || form.eventType === 'both') {
        if (!hasMeaningfulLink(virtual.link)) errs.virtualLink = 'Meeting link is required for online events.';
      }
    }
    return errs;
  }

  function handleNext() {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setStepErrors(errs);
      // Step 3 splits a "Both" event into two tabs (Physical / Online) and
      // only renders one at a time — if every error is on the tab that's
      // currently hidden, Next silently does nothing with no visible sign
      // why. Auto-switch to whichever tab actually needs attention, and
      // for a fully-empty other side, say so explicitly rather than making
      // the user guess.
      if (step === 3 && form.eventType === 'both') {
        const hasVenueErr   = ['venueName', 'street', 'city', 'state', 'organizerName', 'organizerPhone'].some(k => errs[k]);
        const hasVirtualErr = !!errs.virtualLink;
        if (hasVenueErr && hasVirtualErr) {
          dispatch(showToast({ message: 'Please complete both the Physical and Online event details.', type: 'error' }));
        } else if (locationTab === 'physical' && hasVirtualErr) {
          setLocationTab('online');
        } else if (locationTab === 'online' && hasVenueErr) {
          setLocationTab('physical');
        }
      }
      return;
    }
    setStepErrors({});
    setAnimDir('forward');
    if (step < 4) setStep(s => s + 1);
  }

  const baseEvents = discTab === 'booked'    ? bookedEvents
    : discTab === 'favorites' ? savedEvents
    : discTab === 'created'   ? createdEvents.filter(ev => ev.status === createdTab)
    : rdxEvents.filter(ev => upcomingSubTab === 'expired' ? ev.startDate < todayStr : ev.startDate >= todayStr);
  const filteredEvents = baseEvents.filter(ev => {
    if (discCat !== 'All' && !ev.category.toLowerCase().includes(discCat.toLowerCase())) return false;
    if (filters.categories.size > 0) {
      const matched = [...filters.categories].some(c => ev.category.toLowerCase().includes(c.toLowerCase()));
      if (!matched) return false;
    }
    // A "Both" event satisfies either the In-Person or Online filter.
    if (filters.eventType !== 'all' && ev.eventType !== filters.eventType && ev.eventType !== 'both') return false;
    // Match against the event's actual structured address fields (not the
    // formatted display string) so e.g. filtering City "Rajkot" doesn't also
    // match an event whose *venue name* happens to contain "Rajkot".
    if (filters.country.trim() && !(ev.locationObj?.country ?? '').toLowerCase().includes(filters.country.trim().toLowerCase())) return false;
    if (filters.city.trim()    && !(ev.locationObj?.city    ?? '').toLowerCase().includes(filters.city.trim().toLowerCase()))    return false;
    if (filters.state.trim()   && !(ev.locationObj?.state   ?? '').toLowerCase().includes(filters.state.trim().toLowerCase()))   return false;
    if (discSearch.trim()) {
      const q = discSearch.trim().toLowerCase();
      const haystack = `${ev.title} ${ev.desc} ${ev.location}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
  const currentTabLoading = discTab === 'booked'    ? bookedLoading
    : discTab === 'favorites' ? savedLoading
    : discTab === 'created'   ? createdLoading
    : eventsLoading;

  function openFilter() { setPendingF({ ...filters, categories: new Set(filters.categories) }); setShowFilter(true); }
  // Purely a state update — filtering happens client-side in filteredEvents
  // below, so there's nothing to refetch here.
  function commitFilters(next) {
    setFilters(next);
    setShowFilter(false);
  }
  function applyFilters() { commitFilters({ ...pendingF, categories: new Set(pendingF.categories) }); }
  // Reset applies immediately — closes the panel and refetches right away,
  // instead of just clearing the pending fields and leaving the user to
  // press "Apply Filters" afterward to actually see anything change.
  function resetFilters() {
    const def = { eventType: 'all', categories: new Set(), country: '', city: '', state: '' };
    setPendingF(def);
    commitFilters(def);
  }
  function togglePendingCat(cat) { setPendingF(p => { const s = new Set(p.categories); s.has(cat) ? s.delete(cat) : s.add(cat); return { ...p, categories: s }; }); }
  const activeFilterCount = filters.categories.size + (filters.eventType !== 'all' ? 1 : 0)
    + (filters.country.trim() ? 1 : 0) + (filters.city.trim() ? 1 : 0) + (filters.state.trim() ? 1 : 0);

  // Live address preview for the create/edit form's map (steps 3 & 4) — built
  // from whatever venue fields are filled in so far.
  const venueAddressForMap = [venue.street, venue.city, venue.state, venue.country].filter(Boolean).join(', ');

  return (
    <div className="ev-page">
      <AnimatedNav
        activeId="events"
        onNavigate={id => {
          if (id === 'create')   { setCreatePostOpen(true); return; }
          if (id === 'home')     onBack?.();
          if (id === 'courses')  onCoursesClick?.();
          if (id === 'library')  onLibraryClick?.();
          if (id === 'events')   { setShowCreate(false); setStep(1); return; }
          if (id === 'friends')  onGroupsClick?.();
          if (id === 'calendar') onCalendarClick?.();
          if (id === 'messages')  onMessagesClick?.();
          if (id === 'minisites') onMinisitesClick?.();
        }}
      />
      {createPostOpen && <CreatePostModal onClose={() => setCreatePostOpen(false)} />}

      {/* ── Event detail view ── */}
      {!showCreate && selectedEvent && (
        <div className="ev-detail-page">

          {/* Cover image */}
          <div className="ev-detail-cover">
            {getEventImages(selectedEvent).length > 0
              ? <EventCarousel key={selectedEvent.id} images={getEventImages(selectedEvent)} alt={selectedEvent.title} />
              : <EventImgPlaceholder size={44} />}
            {selectedEvent.soldOut && <span className="ev-sold-badge" style={{ top: 16, right: 16, fontSize: 12.5, padding: '6px 12px' }}>SOLD OUT</span>}
            <button className="ev-detail-cover-back-btn" onClick={() => eventFromHome ? onBack?.() : setSelectedEvent(null)} title="Back to Events">
              <BackArrowIcon />
            </button>
          </div>

          {/* Hero row: calendar badge + info */}
          <div className="ev-detail-hero">
            <div className="ev-detail-cal-badge">
              <div className="ev-detail-cal-top">{selectedEvent.month}</div>
              <div className="ev-detail-cal-day">{selectedEvent.day}</div>
              {selectedEvent.startDate && <div className="ev-detail-cal-year">{selectedEvent.startDate.slice(0, 4)}</div>}
            </div>
            <div className="ev-detail-hero-info">
              <p className="ev-detail-datetime">{selectedEvent.fullDate}</p>
              <h1 className="ev-detail-title">{selectedEvent.title}</h1>
              <p className="ev-detail-location"><MapPinIcon /> {eventLocationLabel(selectedEvent)}</p>
              {attendeeCount[selectedEvent.id] !== undefined && (
                <button
                  type="button"
                  className="ev-detail-attendees ev-detail-attendees--clickable"
                  onClick={() => setAttendeesModalOpen(true)}
                  disabled={!attendeeCount[selectedEvent.id]}
                >
                  <FriendsIcon /> {attendeeCount[selectedEvent.id]} attending
                </button>
              )}
            </div>
          </div>

          {/* Tabs + action row */}
          <div className="ev-detail-tab-row">
            <div className="ev-detail-tabs">
              <button
                className={`ev-detail-tab${evDetailTab === 'about' ? ' ev-detail-tab--active' : ''}`}
                onClick={() => setEvDetailTab('about')}
              >About</button>
              <button
                className={`ev-detail-tab${evDetailTab === 'discussion' ? ' ev-detail-tab--active' : ''}${canViewDiscussion ? '' : ' ev-detail-tab--locked'}`}
                onClick={() => canViewDiscussion && setEvDetailTab('discussion')}
                disabled={!canViewDiscussion}
                title={canViewDiscussion ? undefined : 'Join this event to see the discussion'}
              >
                Discussion{!canViewDiscussion && <LockIcon />}
              </button>
            </div>
            <div className="ev-detail-actions">
              {selectedEvent._sourceTab === 'created' && (
                <button className="ev-detail-going-btn" onClick={() => openEditEvent(eventDetail?.id === selectedEvent.id ? { ...selectedEvent, ...eventDetail } : selectedEvent)}>
                  <EditIcon /> Edit Event
                </button>
              )}
              {selectedEvent._sourceTab !== 'created' && (() => {
                const isJoined = joinedIds.has(selectedEvent.id);
                const blockedBySoldOut = !isJoined && selectedEvent.soldOut;
                return (
                  <button
                    className={`ev-detail-join-btn${isJoined ? ' ev-detail-join-btn--joined' : ''}${blockedBySoldOut ? ' ev-detail-join-btn--sold' : ''}`}
                    disabled={joiningId === selectedEvent.id || blockedBySoldOut}
                    onClick={() => isJoined ? handleLeaveEvent() : handleJoinEvent()}
                    title={isJoined ? 'Leave event' : (blockedBySoldOut ? 'This event is sold out' : 'Join event')}
                  >
                    {joiningId === selectedEvent.id ? (
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                    ) : isJoined ? (
                      <>✓ Joined</>
                    ) : blockedBySoldOut ? (
                      <>Sold Out <LockIcon /></>
                    ) : (
                      <>+ Join</>
                    )}
                  </button>
                );
              })()}
              <div className="ev-more-wrap">
                <button className="ev-detail-more-btn" onClick={() => setMoreOpen(v => !v)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
                {moreOpen && (
                  <>
                    <div className="ev-more-backdrop" onClick={() => setMoreOpen(false)} />
                    <div className="ev-more-menu">
                      <button type="button" className="ev-more-link-row" onClick={() => { setMoreOpen(false); handleCopyEventLink(); }}>
                        <div className="ev-more-icon"><LinkIcon /></div>
                        <div>
                          <p className="ev-more-link-url">{eventPermalink(selectedEvent.id)}</p>
                          <p className="ev-more-link-sub">Click to copy this link</p>
                        </div>
                      </button>
                      <div className="ev-more-divider" />
                      {(selectedEvent._sourceTab === 'created' ? [
                        { id: 'share',    icon: <ShareIcon />,    label: 'Share', onClick: () => setShareOpen(true) },
                        { id: 'calendar', icon: <CalendarIcon />, label: calendarIds.has(selectedEvent.id) ? 'Added to Calendar' : 'Add to Calendar', onClick: () => toggleCalendar(selectedEvent.id) },
                        { id: 'sold',     icon: <TicketIcon />,   label: selectedEvent.soldOut ? 'Mark as Available' : 'Mark as Sold Out', onClick: () => handleToggleSoldOut(selectedEvent) },
                      ] : [
                        { id: 'share',    icon: <ShareIcon />,    label: 'Share', onClick: () => setShareOpen(true) },
                        { id: 'calendar', icon: <CalendarIcon />, label: calendarIds.has(selectedEvent.id) ? 'Added to Calendar' : 'Add to Calendar', onClick: () => toggleCalendar(selectedEvent.id) },
                        { id: 'report',   icon: <FlagIcon />,     label: 'Report Event', onClick: () => setReportOpen(true), danger: true },
                      ]).map(item => (
                        <button key={item.id} className="ev-more-item" onClick={() => { setMoreOpen(false); item.onClick?.(); }}>
                          <span className={`ev-more-item-icon${item.danger ? ' ev-more-item-icon--danger' : ''}`}>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Body: main + map sidebar */}
          <div className="ev-detail-body">

            {/* About tab */}
            {evDetailTab === 'about' && (
              <>
                <div className="ev-detail-main">

                  {/* Details card */}
                  {selectedEvent.attendingCount > 0 && (
                    <div className="ev-detail-card">
                      <h3 className="ev-detail-card-title">Details</h3>
                      <div className="ev-detail-responded-row">
                        {(attendeeList[selectedEvent.id]?.length ?? 0) > 0 && (
                          <div className="ev-detail-avatars">
                            {attendeeList[selectedEvent.id].slice(0, 4).map(a => (
                              a.avatar
                                ? <img key={a.id} src={a.avatar} alt={a.name} className="ev-detail-resp-av" />
                                : <div key={a.id} className="ev-detail-resp-av ev-detail-resp-av--fallback">{a.name[0]?.toUpperCase() ?? '?'}</div>
                            ))}
                          </div>
                        )}
                        <span className="ev-detail-responded-txt">{selectedEvent.responded} people responded</span>
                      </div>
                    </div>
                  )}

                  {/* About card */}
                  <div className="ev-detail-card">
                    <h3 className="ev-detail-card-title">About the Event</h3>
                    <p className="ev-detail-about-text">{selectedEvent.about}</p>
                  </div>

                  {/* Event info card */}
                  <div className="ev-detail-card">
                    <h3 className="ev-detail-card-title">Event Info</h3>
                    <div className="ev-detail-info-rows">
                      <div className="ev-detail-info-row"><CalendarIcon /><span>{selectedEvent.fullDate}</span></div>
                      <div className="ev-detail-info-row"><MapPinIcon /><span>{eventLocationLabel(selectedEvent)}</span></div>
                      <div className="ev-detail-info-row"><span className="ev-detail-cat-pill" style={{ background: selectedEvent.catColor + '22', color: selectedEvent.catColor, border: `1px solid ${selectedEvent.catColor}44` }}>{displayCategory(selectedEvent)}</span></div>
                    </div>
                  </div>

                </div>

                {/* Map sidebar */}
                <div className="ev-detail-sidebar">
                  <div className="ev-detail-map-card">
                    <div className="ev-detail-map-bg">
                      {(selectedEvent.venue || selectedEvent.location) ? (
                        <iframe
                          className="ev-map-iframe"
                          title="Event location"
                          src={googleMapsEmbedSrc(selectedEvent.venue || selectedEvent.location)}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      ) : (
                        <div className="ev-detail-map-overlay">
                          <span className="ev-detail-map-label">
                            {selectedEvent.eventType === 'online' ? <OnlineIcon /> : <MapPinIcon />} {eventLocationLabel(selectedEvent)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ev-detail-map-footer">
                      <p className="ev-detail-map-venue">{eventLocationLabel(selectedEvent)}</p>
                      {selectedEvent.eventType !== 'online' && (
                        <button
                          className="ev-detail-map-btn"
                          disabled={!(selectedEvent.venue || selectedEvent.location)}
                          onClick={() => window.open(googleMapsSearchUrl(selectedEvent.venue || selectedEvent.location), '_blank', 'noopener,noreferrer')}
                        >
                          <ExternalLinkIcon /> Open in Maps
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Discussion tab */}
            {evDetailTab === 'discussion' && (
              <>
                {/* Left: comment feed */}
                <div className="ev-detail-main">

                  {/* Trigger — opens the proper modal composer below, matching the
                      main Feed's "Create Post" trigger card */}
                  <div className="ev-disc-composer-trigger" onClick={openDiscComposer}>
                    {authUser?.avatar
                      ? <img src={authUser.avatar} alt="you" className="ev-disc-compose-av" />
                      : <div className="ev-disc-compose-av ev-disc-av-fallback">{(authUser?.fullName ?? 'U')[0]}</div>
                    }
                    <span className="ev-disc-composer-trigger-text">Share something with attendees…</span>
                    <span className="ev-disc-composer-trigger-icon"><ImageIcon /></span>
                  </div>

                  {discComposerOpen && (
                    <div className="cp-overlay" onClick={e => e.target === e.currentTarget && closeDiscComposer()}>
                      <div className="cp-modal" role="dialog" aria-modal="true" aria-labelledby="ev-disc-composer-title">
                        <div className="cp-header">
                          <div>
                            <h2 className="cp-title" id="ev-disc-composer-title">New Discussion Post</h2>
                            <p className="cp-subtitle">Share an update, photo, or video with attendees.</p>
                          </div>
                          <button className="cp-close-btn" onClick={closeDiscComposer} aria-label="Close">✕</button>
                        </div>

                        <div className="cp-body">
                          <textarea
                            className="cp-textarea"
                            placeholder="Share something with attendees…"
                            value={discPostCaption}
                            onChange={e => setDiscPostCaption(e.target.value)}
                            rows={4}
                            autoFocus
                          />

                          {discPostMedia.length > 0 ? (
                            <div className="cp-photo-grid">
                              {discPostMedia.map((m, i) => (
                                <div key={m.url} className="cp-photo-thumb">
                                  {m.type === 'video'
                                    ? <video src={m.url} className="cp-photo-thumb-img" muted />
                                    : <img src={m.url} alt="" className="cp-photo-thumb-img" />
                                  }
                                  <button className="cp-remove-media" onClick={() => removeDiscMedia(i)} aria-label="Remove media">✕</button>
                                </div>
                              ))}
                              <button type="button" className="cp-photo-add-more" onClick={() => discMediaInputRef.current?.click()}>
                                <PlusIcon />
                                <span>Add more</span>
                              </button>
                            </div>
                          ) : (
                            <div className="cp-upload-zone" onClick={() => discMediaInputRef.current?.click()}>
                              <div className="cp-upload-icon"><ImageIcon /></div>
                              <p className="cp-upload-title">Add photos or a video</p>
                              <p className="cp-upload-sub">JPG, PNG, GIF or MP4 — pick multiple at once</p>
                            </div>
                          )}
                          <input ref={discMediaInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={handleDiscMediaPick} />
                        </div>

                        <div className="cp-footer">
                          <div />
                          <button
                            className="cp-post-btn"
                            disabled={discPosting || (!discPostCaption.trim() && discPostMedia.length === 0)}
                            onClick={handlePostDiscussion}
                          >
                            {discPosting ? 'Posting…' : <><span>Post</span><SendIcon /></>}
                          </button>
                        </div>
                      </div>

                      {discCropQueue.length > 0 && (
                        <ImageCropper
                          key={discCropIndex}
                          file={discCropQueue[discCropIndex]}
                          index={discCropIndex}
                          total={discCropQueue.length}
                          onCancel={handleDiscCropCancelAll}
                          onSkip={handleDiscCropSkip}
                          onSave={handleDiscCropSave}
                        />
                      )}
                    </div>
                  )}

                  {/* Discussion feed */}
                  <div className="ev-disc-posts">
                    {discussionsLoading && discussions.length === 0 && <p className="ev-join-loading">Loading discussion…</p>}
                    {!discussionsLoading && discussions.length === 0 && <p className="ev-join-loading">No posts yet — be the first to share something.</p>}
                    {discussions.map(post => (
                      <div key={post.id} className="ev-disc-post">
                        <div className="ev-disc-post-header">
                          {post.author.avatar
                            ? <img src={post.author.avatar} alt={post.author.name} className="ev-disc-comment-av" style={{ cursor: post.author.id ? 'pointer' : 'default' }} onClick={() => onUserClick?.(post.author.id)} />
                            : <span className="ev-disc-comment-av ev-disc-av-fallback" style={{ cursor: post.author.id ? 'pointer' : 'default' }} onClick={() => onUserClick?.(post.author.id)}>{post.author.name[0]}</span>
                          }
                          <div>
                            <span className="ev-disc-comment-name" style={{ cursor: post.author.id ? 'pointer' : 'default' }} onClick={() => onUserClick?.(post.author.id)}>{post.author.name}</span>
                            <span className="ev-disc-post-time">{post.time}</span>
                          </div>
                        </div>

                        {post.caption && <p className="ev-disc-post-caption">{post.caption}</p>}

                        {post.media.length > 0 && (
                          <div className={`ev-disc-post-media ev-disc-post-media--${Math.min(post.media.length, 4)}`}>
                            {post.media.map((m, i) => m.type === 'video'
                              ? <video key={i} src={m.url} controls />
                              : <img key={i} src={m.url} alt="" />
                            )}
                          </div>
                        )}

                        <div className="ev-disc-post-actions">
                          <button className={`ev-disc-like-btn${post.likedByMe ? ' ev-disc-like-btn--active' : ''}`} onClick={() => handleLikeDiscussion(post.id)}>
                            <ThumbUpIcon /> {post.likeCount > 0 ? post.likeCount : 'Like'}
                          </button>
                          <button className="ev-disc-reply-btn" onClick={() => toggleDiscExpanded(post.id)}>
                            {post.commentCount > 0 ? `${post.commentCount} Comment${post.commentCount === 1 ? '' : 's'}` : 'Comment'}
                          </button>
                        </div>

                        {discExpandedId === post.id && (
                          <div className="ev-disc-comments">
                            <div className="ev-disc-compose ev-disc-compose--reply">
                              <input
                                className="ev-disc-compose-input"
                                placeholder="Write a comment…"
                                value={discCommentText[post.id] || ''}
                                onChange={e => setDiscCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter') handlePostDiscComment(post.id); }}
                              />
                              <button className="ev-disc-send-btn" disabled={discCommentBusy || !(discCommentText[post.id] || '').trim()} onClick={() => handlePostDiscComment(post.id)}><SendIcon /></button>
                            </div>

                            {post.comments.map(c => (
                              <div key={c.id}>
                                <div className="ev-disc-comment">
                                  {c.author.avatar
                                    ? <img src={c.author.avatar} alt={c.author.name} className="ev-disc-comment-av" style={{ cursor: c.author.id ? 'pointer' : 'default' }} onClick={() => onUserClick?.(c.author.id)} />
                                    : <span className="ev-disc-comment-av ev-disc-av-fallback" style={{ cursor: c.author.id ? 'pointer' : 'default' }} onClick={() => onUserClick?.(c.author.id)}>{c.author.name[0]}</span>
                                  }
                                  <div className="ev-disc-comment-body">
                                    <div className="ev-disc-comment-bubble">
                                      <span className="ev-disc-comment-name" style={{ cursor: c.author.id ? 'pointer' : 'default' }} onClick={() => onUserClick?.(c.author.id)}>{c.author.name}</span>
                                      <p className="ev-disc-comment-text">{c.text}</p>
                                    </div>
                                    <div className="ev-disc-comment-meta">
                                      <span>{c.time}</span>
                                      <button className={`ev-disc-like-btn${c.likedByMe ? ' ev-disc-like-btn--active' : ''}`} onClick={() => handleLikeDiscComment(post.id, c.id)}><ThumbUpIcon /> {c.likeCount > 0 ? c.likeCount : 'Like'}</button>
                                      <button className="ev-disc-reply-btn" onClick={() => openDiscReply(post.id, c.id)}>Reply</button>
                                    </div>

                                    {discReplyTarget?.discussionId === post.id && discReplyTarget?.commentId === c.id && (
                                      <div className="ev-disc-compose ev-disc-compose--reply">
                                        <input
                                          className="ev-disc-compose-input"
                                          placeholder={`Reply to ${c.author.name}…`}
                                          value={discReplyText}
                                          onChange={e => setDiscReplyText(e.target.value)}
                                          onKeyDown={e => { if (e.key === 'Enter') handleSendDiscReply(); }}
                                          autoFocus
                                        />
                                        <button className="ev-disc-send-btn" disabled={discReplyBusy || !discReplyText.trim()} onClick={handleSendDiscReply}><SendIcon /></button>
                                      </div>
                                    )}

                                    {c.replies.length > 0 && (
                                      <div className="ev-disc-replies">
                                        {c.replies.map(r => (
                                          <div key={r.id} className="ev-disc-comment ev-disc-comment--nested">
                                            {r.author.avatar
                                              ? <img src={r.author.avatar} alt={r.author.name} className="ev-disc-comment-av" style={{ cursor: r.author.id ? 'pointer' : 'default' }} onClick={() => onUserClick?.(r.author.id)} />
                                              : <span className="ev-disc-comment-av ev-disc-av-fallback" style={{ cursor: r.author.id ? 'pointer' : 'default' }} onClick={() => onUserClick?.(r.author.id)}>{r.author.name[0]}</span>
                                            }
                                            <div className="ev-disc-comment-body">
                                              <div className="ev-disc-comment-bubble">
                                                <span className="ev-disc-comment-name" style={{ cursor: r.author.id ? 'pointer' : 'default' }} onClick={() => onUserClick?.(r.author.id)}>{r.author.name}</span>
                                                <p className="ev-disc-comment-text">{r.text}</p>
                                              </div>
                                              <div className="ev-disc-comment-meta">
                                                <span>{r.time}</span>
                                                <button className={`ev-disc-like-btn${r.likedByMe ? ' ev-disc-like-btn--active' : ''}`} onClick={() => handleLikeDiscReply(post.id, c.id, r.id)}><ThumbUpIcon /> {r.likeCount > 0 ? r.likeCount : 'Like'}</button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {discussionsHasMore && (
                      <button className="ev-disc-loadmore-btn" disabled={discussionsLoading} onClick={loadMoreDiscussions}>
                        {discussionsLoading ? 'Loading…' : 'Load more'}
                      </button>
                    )}
                  </div>

                </div>

                {/* Right: description sidebar */}
                <div className="ev-detail-sidebar">

                  <div className="ev-detail-card">
                    <h3 className="ev-detail-card-title">Description</h3>

                    <div className="ev-detail-info-rows" style={{ marginBottom: 16 }}>
                      <div className="ev-detail-info-row">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <span>{selectedEvent.responded} people responded</span>
                      </div>
                      <div className="ev-detail-info-row">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span>{selectedEvent.organizer?.fullName ? `${selectedEvent.organizer.fullName}'s Event` : selectedEvent.title}</span>
                      </div>
                      <div className="ev-detail-info-row">
                        <MapPinIcon />
                        <span>{eventLocationLabel(selectedEvent)}</span>
                      </div>
                      <div className="ev-detail-info-row">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        <span>
                          {selectedEvent.visibility === 'friends' ? 'Friends only · Only friends can join'
                            : selectedEvent.visibility === 'only_me' ? 'Only me · Private event'
                            : 'Public · Anyone can join'}
                        </span>
                      </div>
                    </div>

                    <p className="ev-detail-about-text">{selectedEvent.about}</p>

                    {selectedEvent.category && (
                      <div style={{ marginTop: 14 }}>
                        <span className="ev-detail-cat-pill" style={{ background: selectedEvent.catColor + '22', color: selectedEvent.catColor, border: `1px solid ${selectedEvent.catColor}44` }}>
                          {displayCategory(selectedEvent)}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ── Discovery view ── */}
      {!showCreate && !selectedEvent && (
        <div className="ev-disc-main">
          {/* Top bar */}
          <div className="ev-disc-topbar">
            <div className="ev-disc-tabs">
              <button className={`ev-disc-tab${discTab === 'upcoming' ? ' ev-disc-tab--active' : ''}`} onClick={() => setDiscTab('upcoming')}>Upcoming Events</button>
              <button className={`ev-disc-tab${discTab === 'booked' ? ' ev-disc-tab--active' : ''}`} onClick={() => setDiscTab('booked')}>My Booked Events</button>
              <button className={`ev-disc-tab${discTab === 'favorites' ? ' ev-disc-tab--active' : ''}`} onClick={() => setDiscTab('favorites')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={discTab === 'favorites' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Favorites{savedIds.size > 0 && <span className="ev-fav-count">{savedIds.size}</span>}
              </button>
              <button className={`ev-disc-tab${discTab === 'created' ? ' ev-disc-tab--active' : ''}`} onClick={() => { setDiscTab('created'); setSelectedEvent(null); }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
                My Created Events{createdEvents.length > 0 && <span className="ev-fav-count">{createdEvents.length}</span>}
              </button>
            </div>
            <div className="ev-disc-topbar-right">
              <div className="ev-disc-search-wrap">
                <SearchIcon />
                <input
                  className="ev-disc-search-input"
                  value={discSearch}
                  onChange={e => setDiscSearch(e.target.value)}
                  placeholder="Search events…"
                />
                {discSearch && (
                  <button type="button" className="ev-disc-search-clear" onClick={() => setDiscSearch('')} aria-label="Clear search">✕</button>
                )}
              </div>
              <button className="ev-disc-create-btn" onClick={() => { setStep(1); setShowCreate(true); }}>
                <PlusIcon /> Create Event
              </button>
              <button className={`ev-disc-filter-btn${activeFilterCount > 0 ? ' ev-disc-filter-btn--active' : ''}`} onClick={openFilter}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filters{activeFilterCount > 0 && <span className="ev-filter-badge">{activeFilterCount}</span>}
              </button>
              <div className="ev-disc-view-toggle">
                <button className={`ev-disc-view-btn${viewMode === 'grid' ? ' ev-disc-view-btn--active' : ''}`} onClick={() => setViewMode('grid')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </button>
                <button className={`ev-disc-view-btn${viewMode === 'list' ? ' ev-disc-view-btn--active' : ''}`} onClick={() => setViewMode('list')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Published / Drafts sub-tabs — only under My Created Events */}
          {discTab === 'created' && (
            <div className="ev-created-subtabs">
              <button
                type="button"
                className={`ev-created-subtab${createdTab === 'published' ? ' ev-created-subtab--active' : ''}`}
                onClick={() => setCreatedTab('published')}
              >
                Published{createdEvents.filter(ev => ev.status === 'published').length > 0 && <span className="ev-fav-count">{createdEvents.filter(ev => ev.status === 'published').length}</span>}
              </button>
              <button
                type="button"
                className={`ev-created-subtab${createdTab === 'draft' ? ' ev-created-subtab--active' : ''}`}
                onClick={() => setCreatedTab('draft')}
              >
                Drafts{createdEvents.filter(ev => ev.status === 'draft').length > 0 && <span className="ev-fav-count">{createdEvents.filter(ev => ev.status === 'draft').length}</span>}
              </button>
            </div>
          )}

          {/* Upcoming / Expired sub-tabs — only under Upcoming Events */}
          {discTab === 'upcoming' && (
            <div className="ev-created-subtabs">
              <button
                type="button"
                className={`ev-created-subtab${upcomingSubTab === 'upcoming' ? ' ev-created-subtab--active' : ''}`}
                onClick={() => setUpcomingSubTab('upcoming')}
              >
                Upcoming{rdxEvents.filter(ev => ev.startDate >= todayStr).length > 0 && <span className="ev-fav-count">{rdxEvents.filter(ev => ev.startDate >= todayStr).length}</span>}
              </button>
              <button
                type="button"
                className={`ev-created-subtab${upcomingSubTab === 'expired' ? ' ev-created-subtab--active' : ''}`}
                onClick={() => setUpcomingSubTab('expired')}
              >
                Expired{rdxEvents.filter(ev => ev.startDate < todayStr).length > 0 && <span className="ev-fav-count">{rdxEvents.filter(ev => ev.startDate < todayStr).length}</span>}
              </button>
            </div>
          )}

          {/* Category chips */}
          <div className="ev-disc-cats">
            {DISC_CATEGORIES.map(cat => (
              <button
                key={cat.label}
                className={`ev-disc-cat${discCat === cat.label ? ' ev-disc-cat--active' : ''}`}
                onClick={() => setDiscCat(cat.label)}
              >{cat.label}</button>
            ))}
          </div>

          {/* Event cards — grid or list */}
          {currentTabLoading ? (
            <Loader inline />
          ) : (
          <>
          {filteredEvents.length === 0 && (
            <div className="ev-disc-empty">
              {discTab === 'favorites' ? (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <p>No favourites yet — tap the heart on any event to save it here.</p>
                </>
              ) : (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <p>No events found{activeFilterCount > 0 ? ' — try clearing some filters' : ''}.</p>
                </>
              )}
            </div>
          )}
          <div className={viewMode === 'grid' ? 'ev-disc-grid' : 'ev-disc-list'}>
            {filteredEvents.map(ev => viewMode === 'grid' ? (
              <div key={ev.id} className="ev-disc-card ev-disc-card--clickable" onClick={() => { setSelectedEvent({ ...ev, _sourceTab: isMyEvent(ev) ? 'created' : discTab }); setEvDetailTab('about'); }}>
                <div className="ev-disc-card-img-wrap" style={{ position: 'relative' }}>
                  <SkeletonImg src={ev.img} alt={ev.title} className="ev-disc-card-img" fallback={<EventImgPlaceholder size={30} />} />
                  {ev.soldOut && <span className="ev-sold-badge">SOLD OUT</span>}
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                    <span className="ev-disc-cat-pill" style={{ background: ev.catColor + '44', color: ev.catColor, border: `1px solid ${ev.catColor}66`, padding: '4px 10px', fontSize: '11px', borderRadius: '4px', backdropFilter: 'blur(8px)', fontWeight: '500' }}>{displayCategory(ev)}</span>
                  </div>
                  <div className="ev-disc-date-badge">
                    <span className="ev-disc-date-day">{ev.day}</span>
                    <span className="ev-disc-date-month">{ev.month} {ev.fullDate?.split(' ').pop()}</span>
                  </div>
                  <div className="ev-heart-burst-wrap">
                    <button
                      className={`ev-disc-save-btn${savedIds.has(ev.id) ? ' ev-disc-save-btn--saved' : ''}${heartingIds.has(ev.id) ? ' ev-disc-save-btn--spring' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleSave(ev.id); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={savedIds.has(ev.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                    {(heartParticles[ev.id] || []).map(p => (
                      <span key={p.id} className="ev-heart-particle" style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg` }}>❤️</span>
                    ))}
                  </div>
                </div>
                <div className="ev-disc-card-body">
                  <p className="ev-disc-card-title">{ev.title}</p>
                  <p className="ev-disc-card-loc"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {eventLocationLabel(ev)} • {ev.eventType === 'online' ? 'Online' : ev.eventType === 'offline' ? 'Offline' : 'Both'}</p>
                  <p className="ev-disc-card-desc">{ev.desc}</p>
                  {isCardDescTruncated(ev.desc) && (
                    <button type="button" className="ev-desc-seemore-btn" onClick={e => { e.stopPropagation(); setDescModalEvent(ev); }}>See more</button>
                  )}
                  <div className="ev-disc-card-footer">
                    <div className="ev-disc-card-meta">
                      <span className="ev-disc-attending">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        {ev.attending} attending
                      </span>
                      {ev.seats && <span className="ev-disc-seats">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>
                        {ev.seats}
                      </span>}
                    </div>
                    {discTab === 'created' && ev.status === 'draft' ? (
                      <button
                        type="button"
                        className="ev-disc-book-btn ev-disc-book-btn--publish"
                        disabled={publishingId === ev.id}
                        onClick={e => { e.stopPropagation(); handlePublishDraft(ev.id); }}
                      >
                        {publishingId === ev.id ? 'Publishing…' : 'Publish'}
                      </button>
                    ) : discTab === 'created' || isMyEvent(ev) ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="ev-disc-book-btn ev-disc-book-btn--manage" onClick={e => { e.stopPropagation(); setSelectedEvent({ ...ev, _sourceTab: 'created' }); setEvDetailTab('about'); }}>Manage Event</button>
                        {discTab === 'created' && (
                          <button
                            type="button"
                            className={`ev-disc-book-btn ev-disc-book-btn--sold-toggle${ev.soldOut ? ' ev-disc-book-btn--sold-toggle-active' : ''}`}
                            disabled={soldOutTogglingId === ev.id}
                            title={ev.soldOut ? 'Mark as available' : 'Mark as sold out'}
                            onClick={e => { e.stopPropagation(); handleToggleSoldOut(ev); }}
                          >
                            {soldOutTogglingId === ev.id ? '⟳' : ev.soldOut ? 'Mark Available' : 'Mark Sold Out'}
                          </button>
                        )}
                      </div>
                    ) : discTab === 'booked' ? (
                      <button className="ev-disc-book-btn ev-disc-book-btn--booked" onClick={e => e.stopPropagation()}>Booked</button>
                    ) : ev.soldOut ? (
                      <button className="ev-disc-book-btn ev-disc-book-btn--sold" disabled onClick={e => e.stopPropagation()}>Sold Out</button>
                    ) : (
                      <button className={`ev-disc-book-btn ev-disc-join-btn${joinedIds.has(ev.id) ? ' ev-disc-join-btn--joined' : ''}`} disabled={joiningId === ev.id} onClick={e => { e.stopPropagation(); handleJoinEventCard(ev.id, ev.eventType); }}>{joiningId === ev.id ? '⟳' : joinedIds.has(ev.id) ? '✓ Joined' : '+ Join'}</button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div key={ev.id} className="ev-list-card ev-disc-card--clickable" onClick={() => { setSelectedEvent({ ...ev, _sourceTab: isMyEvent(ev) ? 'created' : discTab }); setEvDetailTab('about'); }}>
                <div className="ev-list-img-wrap" style={{ position: 'relative' }}>
                  <SkeletonImg src={ev.img} alt={ev.title} className="ev-list-img" fallback={<EventImgPlaceholder size={30} />} />
                  {ev.soldOut && <span className="ev-sold-badge">SOLD OUT</span>}
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px' }}>
                    <span className="ev-disc-cat-pill" style={{ background: ev.catColor + '44', color: ev.catColor, border: `1px solid ${ev.catColor}66`, padding: '4px 10px', fontSize: '11px', borderRadius: '4px', backdropFilter: 'blur(8px)', fontWeight: '500' }}>{displayCategory(ev)}</span>
                  </div>
                  <div className="ev-disc-date-badge ev-list-date-badge">
                    <span className="ev-disc-date-day">{ev.day}</span>
                    <span className="ev-disc-date-month">{ev.month} {ev.fullDate?.split(' ').pop()}</span>
                  </div>
                </div>
                <div className="ev-list-body">
                  <p className="ev-disc-card-title">{ev.title}</p>
                  <div className="ev-list-top">
                    <p className="ev-disc-card-loc"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {eventLocationLabel(ev)} • {ev.eventType === 'online' ? 'Online' : ev.eventType === 'offline' ? 'Offline' : 'Both'}</p>
                  </div>
                  <p className="ev-list-desc">{ev.desc}</p>
                  {isCardDescTruncated(ev.desc) && (
                    <button type="button" className="ev-desc-seemore-btn" onClick={e => { e.stopPropagation(); setDescModalEvent(ev); }}>See more</button>
                  )}
                  <div className="ev-disc-card-footer">
                    <div className="ev-disc-card-meta">
                      <span className="ev-disc-attending">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        {ev.attending} attending
                      </span>
                      {ev.seats && <span className="ev-disc-seats">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>
                        {ev.seats}
                      </span>}
                    </div>
                    <div className="ev-list-actions">
                      <div className="ev-heart-burst-wrap">
                        <button className={`ev-disc-save-btn${savedIds.has(ev.id) ? ' ev-disc-save-btn--saved' : ''}${heartingIds.has(ev.id) ? ' ev-disc-save-btn--spring' : ''}`} onClick={e => { e.stopPropagation(); toggleSave(ev.id); }} style={{ position: 'static', background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '6px 10px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={savedIds.has(ev.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        </button>
                        {(heartParticles[ev.id] || []).map(p => (
                          <span key={p.id} className="ev-heart-particle" style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg` }}>❤️</span>
                        ))}
                      </div>
                      {discTab === 'created' && ev.status === 'draft' ? (
                        <button
                          type="button"
                          className="ev-disc-book-btn ev-disc-book-btn--publish"
                          disabled={publishingId === ev.id}
                          onClick={e => { e.stopPropagation(); handlePublishDraft(ev.id); }}
                        >
                          {publishingId === ev.id ? 'Publishing…' : 'Publish'}
                        </button>
                      ) : discTab === 'created' || isMyEvent(ev) ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="ev-disc-book-btn ev-disc-book-btn--manage" onClick={e => { e.stopPropagation(); setSelectedEvent({ ...ev, _sourceTab: 'created' }); setEvDetailTab('about'); }}>Manage Event</button>
                          {discTab === 'created' && (
                            <button
                              type="button"
                              className={`ev-disc-book-btn ev-disc-book-btn--sold-toggle${ev.soldOut ? ' ev-disc-book-btn--sold-toggle-active' : ''}`}
                              disabled={soldOutTogglingId === ev.id}
                              title={ev.soldOut ? 'Mark as available' : 'Mark as sold out'}
                              onClick={e => { e.stopPropagation(); handleToggleSoldOut(ev); }}
                            >
                              {soldOutTogglingId === ev.id ? '⟳' : ev.soldOut ? 'Mark Available' : 'Mark Sold Out'}
                            </button>
                          )}
                        </div>
                      ) : discTab === 'booked' ? (
                        <button className="ev-disc-book-btn ev-disc-book-btn--booked" onClick={e => e.stopPropagation()}>Booked</button>
                      ) : ev.soldOut ? (
                        <button className="ev-disc-book-btn ev-disc-book-btn--sold" disabled onClick={e => e.stopPropagation()}>Sold Out</button>
                      ) : (
                        <button className={`ev-disc-book-btn ev-disc-join-btn${joinedIds.has(ev.id) ? ' ev-disc-join-btn--joined' : ''}`} disabled={joiningId === ev.id} onClick={e => { e.stopPropagation(); handleJoinEventCard(ev.id, ev.eventType); }}>{joiningId === ev.id ? '⟳' : joinedIds.has(ev.id) ? '✓ Joined' : '+ Join'}</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
          )}

         
        </div>
      )}

      {/* ── Filter panel overlay (outside scroll container) ── */}
      {showFilter && (
        <>
          <div className="ev-filter-backdrop" onClick={() => setShowFilter(false)} />
          <div className="ev-filter-panel">
                <div className="ev-filter-panel-header">
                  <span className="ev-filter-panel-title">Filters</span>
                  <div className="ev-filter-header-actions">
                    <button className="ev-filter-reset-btn" onClick={resetFilters}>Reset All</button>
                    <button className="ev-filter-apply-btn" onClick={applyFilters}>Apply Filters</button>
                    <button className="ev-filter-close-btn" onClick={() => setShowFilter(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
                <div className="ev-filter-panel-body">
                  {/* Event Type */}
                  <div className="ev-filter-section">
                    <h4 className="ev-filter-section-title">Event Type</h4>
                    <div className="ev-filter-type-row">
                      {['all', 'offline', 'online'].map(t => (
                        <button
                          key={t}
                          className={`ev-filter-type-btn${pendingF.eventType === t ? ' ev-filter-type-btn--active' : ''}`}
                          onClick={() => setPendingF(p => ({ ...p, eventType: t }))}
                        >
                          {t === 'all' ? 'All' : t === 'offline' ? <><OfflineIcon /> Offline</> : <><OnlineIcon /> Online</>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="ev-filter-section">
                    <div className="ev-filter-section-head">
                      <h4 className="ev-filter-section-title">Categories</h4>
                      {pendingF.categories.size > 0 && <button className="ev-filter-clear-link" onClick={() => setPendingF(p => ({ ...p, categories: new Set() }))}>Clear all</button>}
                    </div>
                    <div className="ev-filter-cats-grid">
                      {DISC_CATEGORIES.filter(c => c.label !== 'All').map(cat => (
                        <label key={cat.label} className="ev-filter-check-label">
                          <input
                            type="checkbox"
                            className="ev-filter-checkbox"
                            checked={pendingF.categories.has(cat.label)}
                            onChange={() => togglePendingCat(cat.label)}
                          />
                          <span className="ev-filter-check-box" />
                          {cat.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Country */}
                  <div className="ev-filter-section">
                    <h4 className="ev-filter-section-title">Country</h4>
                    <CountrySelect
                      value={pendingF.country}
                      onChange={val => setPendingF(p => ({ ...p, country: val }))}
                      placeholder="Any country"
                    />
                  </div>

                  {/* City */}
                  <div className="ev-filter-section">
                    <h4 className="ev-filter-section-title">City</h4>
                    <div className="ev-filter-location-row">
                      <MapPinIcon />
                      <input
                        className="ev-filter-location-input"
                        placeholder="Enter city"
                        value={pendingF.city}
                        onChange={e => setPendingF(p => ({ ...p, city: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div className="ev-filter-section">
                    <h4 className="ev-filter-section-title">State / Province</h4>
                    <div className="ev-filter-location-row">
                      <MapPinIcon />
                      <input
                        className="ev-filter-location-input"
                        placeholder="Enter state or province"
                        value={pendingF.state}
                        onChange={e => setPendingF(p => ({ ...p, state: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

      {/* ── Create event form ── */}
      {showCreate && (
      <div className="ev-main">
        {/* Stepper */}
        <div className="ev-stepper">
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', flexShrink: i < STEPS.length - 1 ? 1 : 0 }}>
              <div className="ev-step-col">
                <div className={`ev-step-circle${step >= s.id ? ' ev-step-circle--active' : ''}`}>{s.id}</div>
                <span className={`ev-step-label${step >= s.id ? ' ev-step-label--active' : ''}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`ev-step-line${step > s.id ? ' ev-step-line--done' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="ev-form-card">
          <div key={step} className={`ev-step-content ev-step-content--${animDir}`}>
          {step === 1 && (
            <>
              <div className="ev-form-header">
                <h2 className="ev-form-title">Step 1: Basic Information</h2>
                <p className="ev-form-subtitle">
                  Set the foundation for your event with essential details that help attendees discover what you're planning.
                </p>
              </div>

              <div className="ev-form-body">
                {/* Title + Tagline */}
                <div className="ev-field-row">
                  <div className="ev-field">
                    <label className="ev-label">Event Title <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      className={`ev-input${stepErrors.title ? ' ev-input--error' : ''}`}
                      name="title"
                      value={form.title}
                      onChange={e => { handleChange(e); if (stepErrors.title) setStepErrors(p => ({ ...p, title: '' })); }}
                      placeholder="e.g. Summer Music Festival 2024"
                    />
                    {stepErrors.title && <span className="ev-field-error">{stepErrors.title}</span>}
                  </div>
                  <div className="ev-field">
                    <label className="ev-label">Short Tagline</label>
                    <input
                      className="ev-input"
                      name="tagline"
                      value={form.tagline}
                      onChange={handleChange}
                      placeholder="A catchy one-liner for your event"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="ev-field">
                  <label className="ev-label">Description / About Event</label>
                  <textarea
                    className="ev-textarea"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Tell your audience what makes this event special..."
                    rows={5}
                  />
                </div>

                {/* Date & Time */}
                <div>
                  <div className="ev-section-header">
                    <span className="ev-section-title">Date & Time</span>
                    <label className="ev-toggle-label">
                      All Day Event
                      <span className="ev-toggle">
                        <input
                          type="checkbox"
                          name="isAllDay"
                          checked={form.isAllDay}
                          onChange={handleChange}
                        />
                        <span className="ev-toggle-slider" />
                      </span>
                    </label>
                  </div>
                  <div className="ev-date-grid">
                    <div className="ev-field">
                      <label className="ev-label ev-label--small">Start Date <span style={{ color: '#ef4444' }}>*</span></label>
                      <CustomDatePicker name="startDate" value={form.startDate} min={todayStr} onChange={e => { handleChange(e); if (stepErrors.startDate) setStepErrors(p => ({ ...p, startDate: '' })); }} placeholder="Pick start date" hasError={!!dateErrors.startDate || !!stepErrors.startDate} />
                      {(dateErrors.startDate || stepErrors.startDate) && <span className="ev-field-error">{dateErrors.startDate || stepErrors.startDate}</span>}
                    </div>
                    <div className="ev-field">
                      <label className="ev-label ev-label--small">Start Time</label>
                      <CustomTimePicker name="startTime" value={form.startTime} onChange={handleChange} placeholder="Pick start time" />
                    </div>
                    <div className="ev-field">
                      <label className="ev-label ev-label--small">End Date</label>
                      <CustomDatePicker name="endDate" value={form.endDate} min={form.startDate || todayStr} onChange={handleChange} placeholder="Pick end date" hasError={!!dateErrors.endDate} />
                      {dateErrors.endDate && <span className="ev-field-error">{dateErrors.endDate}</span>}
                    </div>
                    <div className="ev-field">
                      <label className="ev-label ev-label--small" style={{ opacity: form.isAllDay ? 0.4 : 1 }}>End Time</label>
                      <CustomTimePicker name="endTime" value={form.endTime} onChange={handleChange} disabled={form.isAllDay} placeholder="Pick end time" min={form.startDate === form.endDate ? form.startTime : undefined} hasError={!!dateErrors.endTime} />
                      {dateErrors.endTime && <span className="ev-field-error">{dateErrors.endTime}</span>}
                    </div>
                  </div>
                </div>

                {/* Category + Event Type */}
                <div className="ev-field-row">
                  <div className="ev-field">
                    <label className="ev-label">Event Category <span style={{ color: '#ef4444' }}>*</span></label>
                    <div className={`ev-cat-wrap${stepErrors.category ? ' ev-cat-wrap--error' : ''}`} ref={catDropdownRef}>
                      <button
                        type="button"
                        className={`ev-cat-select-btn${catDropdownOpen ? ' ev-cat-select-btn--open' : ''}`}
                        onClick={() => setCatDropdownOpen(v => !v)}
                        aria-haspopup="listbox"
                        aria-expanded={catDropdownOpen}
                      >
                        <span className={form.category ? '' : 'ev-cat-placeholder'}>
                          {form.category || 'Select a category'}
                        </span>
                        <span className={`ev-vis-chevron${catDropdownOpen ? ' ev-vis-chevron--up' : ''}`}><ChevronDownIcon /></span>
                      </button>

                      {catDropdownOpen && (
                        <ul className="ev-vis-dropdown ev-cat-dropdown" role="listbox">
                          {CATEGORIES.map(c => (
                            <li key={c} role="option" aria-selected={form.category === c}>
                              <button
                                type="button"
                                className={`ev-vis-option${form.category === c ? ' ev-vis-option--active' : ''}`}
                                onClick={() => {
                                  setForm(prev => ({ ...prev, category: c }));
                                  if (stepErrors.category) setStepErrors(p => ({ ...p, category: '' }));
                                  setCatDropdownOpen(false);
                                }}
                              >
                                <span className="ev-vis-label">{c}</span>
                                {form.category === c && <span className="ev-vis-check"><CheckIcon /></span>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {form.category === 'Other' && (
                      <input
                        type="text"
                        className="ev-input ev-cat-other-input"
                        placeholder="Enter Other Category"
                        value={form.categoryOther}
                        onChange={e => {
                          setForm(prev => ({ ...prev, categoryOther: e.target.value }));
                          if (stepErrors.category) setStepErrors(p => ({ ...p, category: '' }));
                        }}
                      />
                    )}
                    {stepErrors.category && <span className="ev-field-error">{stepErrors.category}</span>}
                  </div>
                  <div className="ev-field">
                    <label className="ev-label">Event Type</label>
                    <div className="ev-type-buttons">
                      {EVENT_TYPES.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          className={`ev-type-btn${form.eventType === t.id ? ' ev-type-btn--active' : ''}`}
                          onClick={() => setForm(prev => ({ ...prev, eventType: t.id }))}
                        >
                          {t.icon}
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visibility — same chip + dropdown UI as post create's audience picker */}
                <div className="ev-field">
                  <label className="ev-label">Visibility</label>
                  <div className="ev-vis-wrap" ref={visDropdownRef}>
                    <button
                      type="button"
                      className={`ev-vis-chip${visDropdownOpen ? ' ev-vis-chip--open' : ''}`}
                      onClick={() => setVisDropdownOpen(v => !v)}
                      aria-haspopup="listbox"
                      aria-expanded={visDropdownOpen}
                    >
                      <span className="ev-vis-chip-main">
                        {VISIBILITY_OPTIONS.find(o => o.id === form.visibility)?.icon}
                        {VISIBILITY_OPTIONS.find(o => o.id === form.visibility)?.label}
                      </span>
                      <span className={`ev-vis-chevron${visDropdownOpen ? ' ev-vis-chevron--up' : ''}`}><ChevronDownIcon /></span>
                    </button>

                    {visDropdownOpen && (
                      <ul className="ev-vis-dropdown" role="listbox">
                        {VISIBILITY_OPTIONS.map(opt => (
                          <li key={opt.id} role="option" aria-selected={form.visibility === opt.id}>
                            <button
                              type="button"
                              className={`ev-vis-option${form.visibility === opt.id ? ' ev-vis-option--active' : ''}`}
                              onClick={() => { setForm(prev => ({ ...prev, visibility: opt.id })); setVisDropdownOpen(false); }}
                            >
                              <span className="ev-vis-icon">{opt.icon}</span>
                              <span className="ev-vis-label">{opt.label}</span>
                              {form.visibility === opt.id && <span className="ev-vis-check"><CheckIcon /></span>}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Cover Image(s) */}
                <div className="ev-field">
                  <label className="ev-label">Cover Image{(existingCoverImages.length + coverImages.length) > 1 ? 's' : ''}</label>

                  {(existingCoverImages.length > 0 || coverImages.length > 0) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                      {existingCoverImages.map(url => (
                        <div key={url} style={{ position: 'relative', width: 80, height: 50, flexShrink: 0 }}>
                          <img src={url} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                          <button
                            type="button"
                            onClick={() => removeExistingCoverImage(url)}
                            aria-label="Remove image"
                            style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#1a1f35', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                          >
                            <CoverCloseIcon />
                          </button>
                        </div>
                      ))}
                      {coverImages.map(img => (
                        <div key={img.id} style={{ position: 'relative', width: 80, height: 50, flexShrink: 0 }}>
                          <img src={img.url} alt="cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                          <button
                            type="button"
                            onClick={() => removeCoverImage(img.id)}
                            aria-label="Remove image"
                            style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#1a1f35', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                          >
                            <CoverCloseIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="ev-cover-upload-label" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', border: '1.5px dashed rgba(255,255,255,0.15)', borderRadius: 10, padding: '14px 18px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ width: 80, height: 50, background: 'rgba(255,255,255,0.06)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 22, flexShrink: 0 }}>+</div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{(existingCoverImages.length + coverImages.length) > 0 ? 'Add more images' : 'Upload cover image'}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Recommended: 1200 × 628 px · JPG, PNG, WebP</p>
                    </div>
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleCoverChange} />
                  </label>

                  {coverCropQueue.length > 0 && (
                    <ImageCropper
                      key={coverCropIndex}
                      file={coverCropQueue[coverCropIndex]}
                      index={coverCropIndex}
                      total={coverCropQueue.length}
                      defaultAspect="landscape"
                      onCancel={handleCoverCropCancelAll}
                      onSkip={handleCoverCropSkip}
                      onSave={handleCoverCropSave}
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="ev-form-header">
                <h2 className="ev-form-title">Step 2: Plans & Pricing</h2>
                <p className="ev-form-subtitle">Configure ticket types and pricing options for your attendees.</p>
              </div>

              <div className="ev-s2-layout">
                {/* Left: ticket list + new form */}
                <div className="ev-s2-left">
                  {/* Free / Paid toggle */}
                  <div className="ev-free-paid-toggle">
                    <button
                      type="button"
                      className={`ev-fp-btn${pricingType === 'free' ? ' ev-fp-btn--active' : ''}`}
                      onClick={() => setPricingType('free')}
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      className={`ev-fp-btn${pricingType === 'paid' ? ' ev-fp-btn--active' : ''}`}
                      onClick={() => setPricingType('paid')}
                    >
                      Paid
                    </button>
                  </div>

                  {/* Section title */}
                  <p className="ev-s2-section-title">Ticket Types</p>

                  {pricingType === 'free' ? (
                    /* Free events don't have priced ticket tiers — show a single
                       fixed "Free" entry instead of the paid ticket-type list. */
                    <div className="ev-ticket-list">
                      <div className="ev-ticket-item ev-ticket-item--active ev-ticket-item--readonly">
                        <div className="ev-ticket-icon"><TicketIcon /></div>
                        <p className="ev-ticket-name">Free Ticket</p>
                        <p className="ev-ticket-price ev-ticket-price--active">Free</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Ticket list */}
                      <div className="ev-ticket-list">
                        {tickets.map(tk => {
                          const isActive = selectedTicketId === tk.id;
                          const isEditingThis = editingTicketId === tk.id;
                          return (
                            <div key={tk.id} className="ev-ticket-block">
                              <div
                                className={`ev-ticket-item${isActive ? ' ev-ticket-item--active' : ''}`}
                                onClick={() => {
                                  setSelectedTicketId(tk.id);
                                  setRegistration(prev => ({ ...prev, ticketPrice: tk.price }));
                                }}
                              >
                                <div className="ev-ticket-icon">{TICKET_ICONS[tk.iconType]}</div>
                                <p className="ev-ticket-name">{tk.name}</p>
                                <p className={`ev-ticket-price${isActive ? ' ev-ticket-price--active' : ''}`}>${Number(tk.price).toFixed(2)}</p>
                                <div className="ev-ticket-row-actions">
                                  <button
                                    type="button"
                                    className="ev-ticket-edit-btn"
                                    aria-label="Edit ticket"
                                    onClick={(e) => { e.stopPropagation(); if (isEditingThis) return; requestTicketFormSwitch(() => startEditTicket(tk)); }}
                                  >
                                    <EditIcon />
                                  </button>
                                  <button
                                    type="button"
                                    className="ev-ticket-remove-btn"
                                    aria-label="Delete ticket"
                                    onClick={(e) => { e.stopPropagation(); removeTicket(tk.id); }}
                                  >
                                    <TrashIcon />
                                  </button>
                                </div>
                              </div>

                              {/* Edit form opens right under the ticket being edited,
                                  not always pinned to the bottom of the list. */}
                              {isEditingThis && (
                                <TicketFormPanel
                                  isEditing
                                  newTicket={newTicket}
                                  onChange={handleNewTicketChange}
                                  onSave={saveNewTicket}
                                  onCancel={cancelTicketForm}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* New ticket form — only for adding a brand-new one */}
                      {showNewForm && !editingTicketId && (
                        <TicketFormPanel
                          isEditing={false}
                          newTicket={newTicket}
                          onChange={handleNewTicketChange}
                          onSave={saveNewTicket}
                          onCancel={cancelTicketForm}
                        />
                      )}

                      {/* Add another — always visible */}
                      <button
                        type="button"
                        className="ev-add-ticket-btn"
                        onClick={() => requestTicketFormSwitch(openBlankTicketForm)}
                      >
                        <PlusIcon /> Add Another Ticket Type
                      </button>
                      {stepErrors.tickets && <p className="ev-field-error" style={{ marginTop: 8 }}>{stepErrors.tickets}</p>}
                    </>
                  )}
                </div>

              </div>

              {discardConfirmOpen && (
                <div className="dpm-overlay" onClick={cancelDiscardTicketDraft}>
                  <div className="dpm-box" onClick={e => e.stopPropagation()}>
                    <h2 className="dpm-title">Unsaved ticket type</h2>
                    <p className="dpm-desc">You have an unsaved ticket type ("{newTicket.name}"). Save it first, or continuing will delete it.</p>
                    <div className="dpm-actions">
                      <button className="dpm-cancel-btn" onClick={cancelDiscardTicketDraft} type="button">Go back</button>
                      <button className="dpm-confirm-btn" onClick={confirmDiscardTicketDraft} type="button">Discard it</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div className="ev-form-header">
                <h2 className="ev-form-title">Location &amp; Logistics</h2>
              </div>

              <div className="ev-form-body">
                {/* Physical / Online tab toggle — locked to whichever Event Type was
                    chosen in Step 1 (Online disables Physical, Offline disables Online);
                    "Both" leaves both switchable since that event needs both sections. */}
                <div className="ev-loc-tabs">
                  <button
                    type="button"
                    className={`ev-loc-tab${locationTab === 'physical' ? ' ev-loc-tab--active' : ''}`}
                    onClick={() => setLocationTab('physical')}
                    disabled={form.eventType === 'online'}
                    title={form.eventType === 'online' ? 'Switch Event Type to "Offline" or "Both" in Step 1 to enable this' : undefined}
                  >
                    Physical Event
                  </button>
                  <button
                    type="button"
                    className={`ev-loc-tab${locationTab === 'online' ? ' ev-loc-tab--active' : ''}`}
                    onClick={() => setLocationTab('online')}
                    disabled={form.eventType === 'offline'}
                    title={form.eventType === 'offline' ? 'Switch Event Type to "Online" or "Both" in Step 1 to enable this' : undefined}
                  >
                    Online Event
                  </button>
                </div>

                {locationTab === 'physical' && (
                  <>
                    {/* Venue Information */}
                    <div className="ev-loc-section">
                      <div className="ev-loc-section-title">
                        <MapPinIcon /> Venue Information
                      </div>
                      <div className="ev-loc-section-body">
                        <div className="ev-field">
                          <label className="ev-label ev-label--small">Venue Name <span style={{ color: '#ef4444' }}>*</span></label>
                          <input
                            className={`ev-input${stepErrors.venueName ? ' ev-input--error' : ''}`}
                            value={venue.name}
                            onChange={e => { setVenue(p => ({ ...p, name: e.target.value })); if (stepErrors.venueName) setStepErrors(p => ({ ...p, venueName: '' })); }}
                            placeholder="e.g. Grand Plaza Convention Center"
                          />
                          {stepErrors.venueName && <span className="ev-field-error">{stepErrors.venueName}</span>}
                        </div>
                        <div className="ev-field">
                          <label className="ev-label ev-label--small">Street Address <span style={{ color: '#ef4444' }}>*</span></label>
                          <input
                            className={`ev-input${stepErrors.street ? ' ev-input--error' : ''}`}
                            value={venue.street}
                            onChange={e => { setVenue(p => ({ ...p, street: e.target.value })); if (stepErrors.street) setStepErrors(p => ({ ...p, street: '' })); }}
                            placeholder="123 Event Lane, Downtown"
                          />
                          {stepErrors.street && <span className="ev-field-error">{stepErrors.street}</span>}
                        </div>
                        <div className="ev-field-row">
                          <div className="ev-field">
                            <label className="ev-label ev-label--small">City <span style={{ color: '#ef4444' }}>*</span></label>
                            <input
                              className={`ev-input${stepErrors.city ? ' ev-input--error' : ''}`}
                              value={venue.city}
                              onChange={e => { setVenue(p => ({ ...p, city: e.target.value })); if (stepErrors.city) setStepErrors(p => ({ ...p, city: '' })); }}
                              placeholder="City"
                            />
                            {stepErrors.city && <span className="ev-field-error">{stepErrors.city}</span>}
                          </div>
                          <div className="ev-field">
                            <label className="ev-label ev-label--small">State / Province <span style={{ color: '#ef4444' }}>*</span></label>
                            <input
                              className={`ev-input${stepErrors.state ? ' ev-input--error' : ''}`}
                              value={venue.state}
                              onChange={e => { setVenue(p => ({ ...p, state: e.target.value })); if (stepErrors.state) setStepErrors(p => ({ ...p, state: '' })); }}
                              placeholder="State"
                            />
                            {stepErrors.state && <span className="ev-field-error">{stepErrors.state}</span>}
                          </div>
                        </div>
                        <div className="ev-field-row">
                          <div className="ev-field">
                            <label className="ev-label ev-label--small">Country</label>
                            <CountrySelect value={venue.country} onChange={val => setVenue(p => ({ ...p, country: val }))} placeholder="Select country" />
                          </div>
                          <div className="ev-field">
                            <label className="ev-label ev-label--small">Pin Code / ZIP</label>
                            <input className="ev-input" value={venue.pinCode} onChange={e => setVenue(p => ({ ...p, pinCode: e.target.value }))} placeholder="000000" />
                          </div>
                        </div>
                        {/* Map preview — a plain Google Maps embed (no API key needed) once
                            there's enough address to search for. */}
                        <div className="ev-map-preview">
                          {venueAddressForMap ? (
                            <>
                              <iframe
                                className="ev-map-iframe"
                                title="Venue location preview"
                                src={googleMapsEmbedSrc(venueAddressForMap)}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                              />
                              <div className="ev-map-actions">
                                <button type="button" className="ev-map-open-btn" onClick={() => window.open(googleMapsSearchUrl(venueAddressForMap), '_blank', 'noopener,noreferrer')}>
                                  <ExternalLinkIcon /> Open in Google Maps
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="ev-map-bg" />
                              <div className="ev-map-actions">
                                <span className="ev-map-empty-hint"><PinMapIcon /> Fill in street/city above to preview on the map</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Parking & Accessibility */}
                    <div className="ev-loc-section">
                      <div className="ev-loc-section-title">
                        <ParkingIcon /> Parking &amp; Accessibility
                      </div>
                      <div className="ev-loc-section-body">
                        <div className="ev-field">
                          <label className="ev-label ev-label--small">Parking Details</label>
                          <textarea
                            className="ev-textarea"
                            value={parking}
                            onChange={e => setParking(e.target.value)}
                            placeholder="Describe parking availability, valet services, or nearby public transit options..."
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Organizer Details */}
                    <div className="ev-loc-section">
                      <div className="ev-loc-section-title">
                        <OrganizerIcon /> Organizer Details
                      </div>
                      <div className="ev-loc-section-body">
                        <div className="ev-field">
                          <label className="ev-label ev-label--small">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                          <input
                            className={`ev-input${stepErrors.organizerName ? ' ev-input--error' : ''}`}
                            value={organizer.fullName}
                            onChange={e => { setOrganizer(p => ({ ...p, fullName: e.target.value })); if (stepErrors.organizerName) setStepErrors(p => ({ ...p, organizerName: '' })); }}
                            placeholder="John Doe"
                          />
                          {stepErrors.organizerName && <span className="ev-field-error">{stepErrors.organizerName}</span>}
                        </div>
                        <div className="ev-field-row">
                          <div className="ev-field">
                            <label className="ev-label ev-label--small">Email Address <span style={{ color: '#5c6a8c', fontWeight: 400 }}>(optional)</span></label>
                            <input className="ev-input" type="email" value={organizer.email} onChange={e => setOrganizer(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" />
                          </div>
                          <div className="ev-field">
                            <label className="ev-label ev-label--small">Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                            <PhoneInput
                              hasError={!!stepErrors.organizerPhone}
                              value={organizer.phone}
                              onChange={val => { setOrganizer(p => ({ ...p, phone: val })); if (stepErrors.organizerPhone) setStepErrors(p => ({ ...p, organizerPhone: '' })); }}
                              placeholder="(555) 000-0000"
                            />
                            {stepErrors.organizerPhone && <span className="ev-field-error">{stepErrors.organizerPhone}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {locationTab === 'online' && (
                  <div className="ev-loc-section">
                    <div className="ev-loc-section-title">
                      <MonitorIcon /> Virtual Access
                    </div>
                    <div className="ev-loc-section-body">
                      <div className="ev-field">
                        <label className="ev-label ev-label--small">Meeting Link / Platform <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                          className={`ev-input${stepErrors.virtualLink ? ' ev-input--error' : ''}`}
                          value={virtual.link}
                          onChange={e => { setVirtual(p => ({ ...p, link: e.target.value })); if (stepErrors.virtualLink) setStepErrors(p => ({ ...p, virtualLink: '' })); }}
                          placeholder="https://zoom.us/j/..."
                        />
                        {stepErrors.virtualLink && <span className="ev-field-error">{stepErrors.virtualLink}</span>}
                      </div>
                      <div className="ev-field">
                        <label className="ev-label ev-label--small">Instructions for Joiners</label>
                        <textarea
                          ref={instructionsRef}
                          className="ev-textarea"
                          value={virtual.instructions}
                          onChange={e => setVirtual(p => ({ ...p, instructions: e.target.value }))}
                          onFocus={handleInstructionsFocus}
                          onKeyDown={handleInstructionsKeyDown}
                          placeholder="e.g. Password will be sent via email&#10;Join 5 minutes early&#10;Camera optional"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <div className="ev-s4-wrap">
              {/* Main review cards */}
              <div className="ev-s4-main">
                <h2 className="ev-s4-title">{editingEventId ? 'Review & Save Changes' : 'Review & Publish'}</h2>

                {/* Basic Info card */}
                <div className="ev-review-card">
                  <div className="ev-review-card-header">
                    <span className="ev-review-card-label">Basic Info</span>
                    <button type="button" className="ev-review-edit-btn" onClick={() => setStep(1)}><EditIcon /> Edit</button>
                  </div>
                  <div className="ev-review-card-body">
                    <p className="ev-review-field-label">EVENT TITLE</p>
                    <p className="ev-review-field-value ev-review-title">{form.title || 'Modern Design Collective: Summer Mixer'}</p>
                    <p className="ev-review-field-label" style={{ marginTop: 12 }}>DESCRIPTION</p>
                    <p className="ev-review-field-value ev-review-desc">
                      {form.description || 'Join us for an evening of networking, inspiration, and collaborative discussions on the future of UI/UX design. Meet industry leaders and fresh talent in a vibrant, creative environment.'}
                    </p>
                    <div className="ev-review-tags">
                      {form.category
                        ? <span className="ev-review-tag">{form.category === 'Other' && form.categoryOther.trim() ? form.categoryOther : form.category}</span>
                        : <><span className="ev-review-tag">Design</span><span className="ev-review-tag">Networking</span><span className="ev-review-tag">Social</span></>
                      }
                    </div>
                  </div>
                </div>

                {/* Pricing & Tickets card */}
                <div className="ev-review-card">
                  <div className="ev-review-card-header">
                    <span className="ev-review-card-label">Pricing &amp; Tickets</span>
                    <button type="button" className="ev-review-edit-btn" onClick={() => setStep(2)}><EditIcon /> Edit</button>
                  </div>
                  <div className="ev-review-card-body ev-review-card-body--tickets">
                    {pricingType === 'free' ? (
                      /* Matches step 2's own "Free events skip priced ticket
                         tiers" treatment — `tickets` still holds whatever
                         paid tiers were last configured (or the defaults),
                         but they're neither shown nor submitted for a free
                         event. */
                      <div className="ev-review-ticket-row">
                        <div>
                          <p className="ev-review-ticket-name">Free Ticket</p>
                        </div>
                        <span className="ev-review-ticket-price">Free</span>
                      </div>
                    ) : (
                      tickets.map(tk => (
                        <div key={tk.id} className="ev-review-ticket-row">
                          <div>
                            <p className="ev-review-ticket-name">{tk.name}</p>
                            <p className="ev-review-ticket-cap">Capacity: {tk.seats || '—'} Guests</p>
                          </div>
                          <span className="ev-review-ticket-price">${Number(tk.price).toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Location card */}
                <div className="ev-review-card">
                  <div className="ev-review-card-header">
                    <span className="ev-review-card-label">Location</span>
                    <button type="button" className="ev-review-edit-btn" onClick={() => setStep(3)}><EditIcon /> Edit</button>
                  </div>
                  <div className="ev-review-card-body ev-review-location-row">
                    <div>
                      {(form.eventType === 'offline' || form.eventType === 'both') && (
                        <>
                          <p className="ev-review-field-label">VENUE NAME</p>
                          <p className="ev-review-field-value ev-review-venue-name">
                            {venue.name || 'The Innovation Hub – Studio B'}
                          </p>
                          <p className="ev-review-field-label" style={{ marginTop: 10 }}>ADDRESS</p>
                          <p className="ev-review-field-value ev-review-address">
                            {venue.street
                              ? `${venue.street}${venue.city ? ', ' + venue.city : ''}${venue.state ? ', ' + venue.state : ''}${venue.pinCode ? ' ' + venue.pinCode : ''}`
                              : '452 Creative Way,\nDowntown Design District,\nSF 94103'
                            }
                          </p>
                        </>
                      )}
                      {(form.eventType === 'online' || form.eventType === 'both') && (
                        <div style={form.eventType === 'both' ? { marginTop: 14 } : undefined}>
                          <p className="ev-review-field-label">MEETING LINK</p>
                          <p className="ev-review-field-value ev-review-venue-name">
                            {hasMeaningfulLink(virtual.link) ? virtual.link : 'Link will be shared with attendees'}
                          </p>
                          {virtual.instructions.trim() && (
                            <>
                              <p className="ev-review-field-label" style={{ marginTop: 10 }}>INSTRUCTIONS</p>
                              <p className="ev-review-field-value ev-review-address">{virtual.instructions}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {form.eventType !== 'online' && (
                      <div className="ev-review-map-thumb">
                        {venueAddressForMap ? (
                          <iframe
                            className="ev-map-iframe"
                            title="Venue location"
                            src={googleMapsEmbedSrc(venueAddressForMap)}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        ) : (
                          <div className="ev-review-map-inner" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}
          </div>{/* ev-step-content */}

          <div className="ev-form-divider" />
          <div className="ev-form-footer">
            {step === 1 ? (
              <button className="ev-cancel-btn" onClick={handleBack}>Cancel</button>
            ) : (
              <button className="ev-cancel-btn ev-back-btn" onClick={handleBack}>
                <ArrowLeftIcon /> Back
              </button>
            )}
            {step < 4 ? (
              <button className="ev-next-btn" onClick={handleNext}>
                Next Step <ArrowRightIcon />
              </button>
            ) : (
              /* Step 4's Publish/Save-as-Draft actions live in the footer next to
                 Back, instead of a separate sidebar column — previously they sat
                 in a `.ev-s4-sidebar` positioned with a hardcoded 320px top margin
                 to roughly line up with this footer, which broke if the review
                 cards above it ever changed height. */
              <div className="ev-s4-footer-actions">
                <p className="ev-publish-notice ev-publish-notice--inline">
                  By publishing, you agree to our <span>Terms of Service</span> and <span>Event Guidelines.</span>
                </p>
                {!editingEventId && (
                  <button type="button" className="ev-draft-btn ev-draft-btn--footer" disabled={createLoading || draftLoading} onClick={() => { setDraftLoading(true); handlePublish(true); }}>
                    {draftLoading ? 'Saving…' : 'Save as Draft'}
                  </button>
                )}
                <button type="button" className="ev-publish-btn ev-publish-btn--footer" disabled={createLoading || updateLoading || preparingImages || draftLoading} onClick={() => handlePublish(false)}>
                  {editingEventId
                    ? (preparingImages ? 'Preparing images…' : updateLoading ? 'Saving…' : 'Save Changes')
                    : (createLoading ? 'Publishing…' : 'Publish Event')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* ── Card "See more" → full description modal ── */}
      {descModalEvent && (
        <div className="ev-desc-modal-overlay" onClick={() => setDescModalEvent(null)}>
          <div className="ev-desc-modal" onClick={e => e.stopPropagation()}>
            <div className="ev-desc-modal-header">
              <h2 className="ev-desc-modal-title">{descModalEvent.title}</h2>
              <button className="ev-desc-modal-close" onClick={() => setDescModalEvent(null)} aria-label="Close">✕</button>
            </div>
            <div className="ev-desc-modal-body">
              <p>{descModalEvent.about || descModalEvent.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── "X attending" → who's attending modal (reactions-modal style) ── */}
      {attendeesModalOpen && selectedEvent && (
        <div className="ev-attendees-modal-overlay" onClick={() => setAttendeesModalOpen(false)}>
          <div className="ev-attendees-modal" onClick={e => e.stopPropagation()}>
            <div className="ev-attendees-modal-header">
              <h2 className="ev-attendees-modal-title">
                {attendeeCount[selectedEvent.id] ?? (attendeeList[selectedEvent.id]?.length ?? 0)} Attending
              </h2>
              <button className="ev-attendees-modal-close" onClick={() => setAttendeesModalOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className="ev-attendees-modal-list">
              {(attendeeList[selectedEvent.id] ?? []).length === 0 && (
                <p className="ev-attendees-modal-empty">No attendees yet.</p>
              )}
              {(attendeeList[selectedEvent.id] ?? []).map(a => (
                <div
                  key={a.id}
                  className="ev-attendees-modal-person"
                  style={{ cursor: a.id ? 'pointer' : 'default' }}
                  onClick={() => { if (a.id) { onUserClick?.(a.id); setAttendeesModalOpen(false); } }}
                >
                  <div className="ev-attendees-modal-avatar">
                    {a.avatar ? <img src={a.avatar} alt={a.name} /> : (a.name[0]?.toUpperCase() ?? '?')}
                  </div>
                  <span className="ev-attendees-modal-name">{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {deletedNoticeModal && (
        <div className="ev-deleted-modal-overlay">
          <div className="ev-deleted-modal">
            <div className="ev-deleted-modal-icon">🚫</div>
            <h2 className="ev-deleted-modal-title">Event Deleted</h2>
            <p className="ev-deleted-modal-text">
              "{deletedNoticeModal.eventName}" has been deleted by an admin.
            </p>
            {deletedNoticeModal.reason && (
              <p className="ev-deleted-modal-reason">Reason: {deletedNoticeModal.reason}</p>
            )}
            <button
              className="ev-deleted-modal-ok-btn"
              onClick={() => {
                setDeletedNoticeModal(null);
                setSelectedEvent(null);
                if (eventFromHome) onBack?.();
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ── Share sheet — same component/UX as sharing a post ── */}
      {shareOpen && selectedEvent && (
        <ShareSheet
          url={eventPermalink(selectedEvent.id)}
          title={selectedEvent.title || 'Check out this event'}
          text={`${selectedEvent.title || 'Check out this event'} on Kink Catalyst`}
          heading="Share event"
          onClose={() => setShareOpen(false)}
        />
      )}

      {/* ── Report Event modal ── */}
      {reportOpen && (
        <div className="report-overlay" onClick={e => { if (e.target === e.currentTarget) closeReportModal(); }}>
          <div className="report-modal">
            <div className="report-modal-header">
              <h2 className="report-modal-title">Report Event</h2>
              <button className="report-close-btn" onClick={closeReportModal}>✕</button>
            </div>
            {reportDone ? (
              <div className="report-success">
                <div className="report-success-icon">✓</div>
                <p>Thank you for your report. We'll review it and take action if it violates our community guidelines.</p>
                <button className="report-success-close" onClick={closeReportModal}>Done</button>
              </div>
            ) : (
              <>
                <div className="report-modal-body">
                  <h3 className="report-question">What's going on?</h3>
                  <p className="report-subtitle">We'll check for all community guidelines, so don't worry about making the perfect choice.</p>
                  <ul className="report-reasons">
                    {EVENT_REPORT_REASONS.map(reason => (
                      <li key={reason} className="report-reason-item">
                        <label className="report-reason-label">
                          <span className={`report-radio${reportReason === reason ? ' report-radio--checked' : ''}`} />
                          <input
                            type="radio"
                            name="event-report-reason"
                            value={reason}
                            checked={reportReason === reason}
                            onChange={() => setReportReason(reason)}
                            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                          />
                          <span className="report-reason-text">{reason}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="report-modal-footer">
                  <button className="report-submit-btn" onClick={submitReportEvent} disabled={!reportReason || reportSubmitting}>
                    {reportSubmitting ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── "+ Join" ticket → attendee details flow ── */}
      {joinFlow && (
        <div className="ev-join-overlay" onClick={closeJoinFlow}>
          <div className="ev-join-modal" onClick={e => e.stopPropagation()}>
            <div className="ev-join-modal-header">
              <h3 className="ev-join-modal-title">
                {joinFlow.step === 'ticket' ? 'Select a Ticket' : joinFlow.step === 'members' ? 'Attendee Details' : 'Confirm & Join'}
              </h3>
              <button className="ev-join-modal-close" onClick={closeJoinFlow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="ev-join-modal-body">
              {joinFlow.step === 'ticket' ? (
                <>
                {joinFlow.eventType && (
                  <div className="ev-join-type-row">
                    {joinFlow.eventType === 'online' ? <OnlineIcon /> : joinFlow.eventType === 'offline' ? <OfflineIcon /> : <><OnlineIcon /><OfflineIcon /></>}
                    <span>{joinFlow.eventType === 'online' ? 'Online' : joinFlow.eventType === 'offline' ? 'Offline' : 'Online & Offline'}</span>
                  </div>
                )}
                {joinFlow.ticketsLoading ? (
                  <p className="ev-join-loading">Loading tickets…</p>
                ) : (
                  <div className="ev-ticket-list">
                    {joinFlow.tickets.map(tk => {
                      const soldOut = tk.seatsAvailable === 0;
                      return (
                        <div
                          key={tk.id}
                          className={`ev-ticket-item${joinFlow.ticketId === tk.id ? ' ev-ticket-item--active' : ''}${soldOut ? ' ev-ticket-item--sold-out' : ''}`}
                          onClick={() => selectJoinTicket(tk)}
                          aria-disabled={soldOut}
                        >
                          <div className="ev-ticket-icon">{TICKET_ICONS[tk.iconType] ?? TICKET_ICONS.ticket}</div>
                          <p className="ev-ticket-name">{tk.name}</p>
                          <p className={`ev-ticket-price${joinFlow.ticketId === tk.id ? ' ev-ticket-price--active' : ''}`}>
                            {Number(tk.price) > 0 ? `$${tk.price}` : 'Free'}
                          </p>
                          {tk.seatsAvailable != null && (
                            <p className={`ev-join-seats-left${soldOut ? ' ev-join-seats-left--sold-out' : ''}`}>
                              {soldOut ? 'Sold out' : `${tk.seatsAvailable} left`}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                </>
              ) : joinFlow.step === 'members' ? (() => {
                const maxSeats = joinFlow.tickets.find(t => t.id === joinFlow.ticketId)?.seatsAvailable;
                return (
                <>
                  <div className="ev-join-qty-row">
                    <span className="ev-join-qty-label">Quantity</span>
                    <div className="ev-join-qty-stepper">
                      <button type="button" onClick={() => setJoinQuantity(joinFlow.quantity - 1)} disabled={joinFlow.quantity <= 1}>−</button>
                      <span>{joinFlow.quantity}</span>
                      <button type="button" onClick={() => setJoinQuantity(joinFlow.quantity + 1)} disabled={maxSeats != null && joinFlow.quantity >= maxSeats}>+</button>
                    </div>
                  </div>
                  {maxSeats != null && (
                    <p className="ev-join-seats-cap-note">{maxSeats} seat{maxSeats === 1 ? '' : 's'} available for this ticket</p>
                  )}

                  {joinFlow.members.map((m, i) => (
                    <div className="ev-join-member-row" key={i}>
                      <span className="ev-join-member-num">Attendee {i + 1}</span>
                      <div className="ev-join-member-fields">
                        <input type="text" placeholder="Name" value={m.name} onChange={e => updateJoinMember(i, 'name', e.target.value)} />
                        <input type="number" min="0" placeholder="Age" value={m.age} onChange={e => updateJoinMember(i, 'age', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </>
                );
              })() : (() => {
                const selectedTicket = joinFlow.tickets.find(t => t.id === joinFlow.ticketId);
                const unitPrice = Number(selectedTicket?.price) || 0;
                const total = unitPrice * joinFlow.quantity;
                return (
                  <>
                    <div className="ev-join-summary">
                      <div className="ev-join-summary-row">
                        <span>Ticket</span>
                        <span>{selectedTicket?.name ?? 'Free Entry'}</span>
                      </div>
                      <div className="ev-join-summary-row">
                        <span>Price per ticket</span>
                        <span>{unitPrice > 0 ? `$${unitPrice.toFixed(2)}` : 'Free'}</span>
                      </div>
                      <div className="ev-join-summary-row">
                        <span>Quantity</span>
                        <span>{joinFlow.quantity}</span>
                      </div>
                      <div className="ev-join-summary-row ev-join-summary-row--total">
                        <span>Total</span>
                        <span>{total > 0 ? `$${total.toFixed(2)}` : 'Free'}</span>
                      </div>
                    </div>

                    <div className="ev-join-summary-attendees">
                      {joinFlow.members.map((m, i) => (
                        <div className="ev-join-summary-row" key={i}>
                          <span>Attendee {i + 1}</span>
                          <span>{m.name} · Age {m.age}</span>
                        </div>
                      ))}
                    </div>

                    {total > 0 && (
                      <p className="ev-join-refund-note">You will not receive a refund if you cancel after joining.</p>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="ev-join-modal-footer">
              {joinFlow.step === 'members' && joinFlow.tickets.length > 0 && (
                <button className="ev-join-back-btn" onClick={() => setJoinFlow(prev => prev ? { ...prev, step: 'ticket' } : prev)}>Back</button>
              )}
              {joinFlow.step === 'members' && (
                <button
                  className="ev-join-done-btn"
                  disabled={joinFlow.members.some(m => !m.name.trim() || m.age === '')}
                  onClick={() => setJoinFlow(prev => prev ? { ...prev, step: 'confirm' } : prev)}
                >
                  Continue
                </button>
              )}
              {joinFlow.step === 'confirm' && (
                <button className="ev-join-back-btn" onClick={() => setJoinFlow(prev => prev ? { ...prev, step: 'members' } : prev)}>Back</button>
              )}
              {joinFlow.step === 'confirm' && (
                <button className="ev-join-done-btn" disabled={joinFlow.submitting} onClick={submitJoinFlow}>
                  {joinFlow.submitting ? 'Joining…' : 'Confirm & Join'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

