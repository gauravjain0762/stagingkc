import MiniSiteGroupsDiscovery from './MiniSiteGroupsDiscovery';
import './MiniSiteGroupsPage.css';

export default function MiniSiteGroupsPage({ siteName, siteId }) {
  return <MiniSiteGroupsDiscovery siteId={siteId} />;
}
