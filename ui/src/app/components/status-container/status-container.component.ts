import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ProjectionsService } from "../../services/projections.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-status-container",
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatListModule, MatProgressBarModule, MatTooltipModule],
  templateUrl: "./status-container.component.html",
  styleUrl: "./status-container.component.css",
})
export class StatusContainerComponent implements OnInit, OnDestroy {
  // Core projections
  currentStatus: any = null;
  location: any = null;
  shipInfo: any = null;
  commander: any = null;
  inCombat: any = null;
  friends: any = null;
  colonisationConstruction: any = null;
  target: any = null;
  navInfo: any = null;
  exobiologyScan: any = null;
  cargo: any = null;
  backpack: any = null;
  suitLoadout: any = null;
  loadout: any = null;
  missions: any = null;
  engineerProgress: any = null;
  communityGoal: any = null;
  dockingEvents: any = null;
  wing: any = null;
  idle: any = null;
  materials: any = null;
  moduleInfo: any = null;
  rank: any = null;
  progress: any = null;
  reputation: any = null;
  statistics: any = null;
  powerplay: any = null;
  shipLocker: any = null;
  shipyard: any = null;
  storedShips: any = null;
  market: any = null;
  outfitting: any = null;
  
  // UI state
  showFriendsPanel = false;
  showColonisationPanel = false;
  showWingPanel = false;
  showFightersPanel = false;
  showNavDetails = false;
  showBackpackDetails = false;
  showCargoDetails = false;
  showAllModules = false;
  
  // Constants for flags
  statusFlags = [
    'Docked', 'Landed', 'LandingGearDown', 'ShieldsUp', 'Supercruise', 'FlightAssistOff',
    'HardpointsDeployed', 'InWing', 'LightsOn', 'CargoScoopDeployed', 'SilentRunning',
    'ScoopingFuel', 'SrvHandbrake', 'SrvUsingTurretView', 'SrvTurretRetracted', 'SrvDriveAssist',
    'FsdMassLocked', 'FsdCharging', 'FsdCooldown', 'LowFuel', 'OverHeating', 'HasLatLong',
    'IsInDanger', 'BeingInterdicted', 'InMainShip', 'InFighter', 'InSRV', 'HudInAnalysisMode',
    'NightVision', 'fsdJump', 'srvHighBeam'
  ];
  
  odysseyFlags = [
    'OnFoot', 'InTaxi', 'InMulticrew', 'OnFootInStation', 'OnFootOnPlanet', 'AimDownSight',
    'LowOxygen', 'LowHealth', 'Cold', 'Hot', 'VeryCold', 'VeryHot', 'GlideMode', 'OnFootInHangar',
    'OnFootSocialSpace', 'OnFootExterior', 'BreathableAtmosphere'
  ];
  
  private subscriptions: Subscription[] = [];
  
  // Timer state for countdowns
  private rebuildIntervalId: any = null;
  currentTimeMs: number = Date.now();

  constructor(private projectionsService: ProjectionsService) {}

  ngOnInit(): void {
    // Subscribe only to projections referenced in the template
    this.subscriptions.push(
      this.projectionsService.shipInfo$.subscribe(shipInfo => {
        const prev = this.shipInfo?.Type;
        this.shipInfo = shipInfo;

        
        if (this.shipInfo?.Type !== prev) {
          this.updateShipImage();
        } else if (!this.shipImgSrc) {
          this.updateShipImage();
        }
      }),
      
      this.projectionsService.location$.subscribe(location => {
        this.location = location;
      }),
      
      this.projectionsService.shipInfo$.subscribe(shipInfo => {
        this.shipInfo = shipInfo;
        
      }),
      
      this.projectionsService.friends$.subscribe(friends => {
        this.friends = friends;
      }),
      
      this.projectionsService.colonisationConstruction$.subscribe(colonisation => {
        this.colonisationConstruction = colonisation;
      }),
      
      this.projectionsService.target$.subscribe(target => {
        this.target = target;
      }),
      
      this.projectionsService.navInfo$.subscribe(navInfo => {
        this.navInfo = navInfo;
      }),
      
      this.projectionsService.exobiologyScan$.subscribe(scan => {
        this.exobiologyScan = scan;
      }),
      
      this.projectionsService.cargo$.subscribe(cargo => {
        this.cargo = cargo;
      }),
      
      this.projectionsService.backpack$.subscribe(backpack => {
        this.backpack = backpack;
      }),
      
      this.projectionsService.suitLoadout$.subscribe(suitLoadout => {
        this.suitLoadout = suitLoadout;
      }),
      
      this.projectionsService.loadout$.subscribe(loadout => {
        this.loadout = loadout;
      }),
      
      this.projectionsService.wing$.subscribe(wing => {
        this.wing = wing;
      })
    );

    // Start 1-second interval to update countdowns
    this.rebuildIntervalId = setInterval(() => {
      this.currentTimeMs = Date.now();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.rebuildIntervalId) {
      clearInterval(this.rebuildIntervalId);
      this.rebuildIntervalId = null;
    }
  }

  // Helper function for template to get object keys
  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  getStatusIcon(status: any): string {
    if (!status) return 'help_outline';
    
    if (status.flags?.InDanger) return 'warning';
    if (status.flags?.Docked) return 'home';
    if (status.flags?.Landed) return 'flight_land';
    if (status.flags?.InFlight) return 'flight';
    if (status.flags?.Supercruise) return 'rocket_launch';
    
    return 'info';
  }

  getStatusColor(status: any): string {
    if (!status) return '#666';
    
    if (status.flags?.InDanger) return '#f44336';
    if (status.flags?.Docked) return '#4caf50';
    if (status.flags?.Landed) return '#2196f3';
    if (status.flags?.InFlight) return '#ff9800';
    if (status.flags?.Supercruise) return '#9c27b0';
    
    return '#666';
  }

  // Toggle methods
  toggleColonisationPanel(): void {
    this.showColonisationPanel = !this.showColonisationPanel;
  }

  toggleFriendsPanel(): void {
    this.showFriendsPanel = !this.showFriendsPanel;
  }

  toggleWingPanel(): void {
    this.showWingPanel = !this.showWingPanel;
  }

  toggleFightersPanel(): void {
    this.showFightersPanel = !this.showFightersPanel;
  }

  // Methods to close panels
  closeFriendsPanel(): void {
    this.showFriendsPanel = false;
  }

  closeWingPanel(): void {
    this.showWingPanel = false;
  }

  closeFightersPanel(): void {
    this.showFightersPanel = false;
  }

  closeColonisationPanel(): void {
    this.showColonisationPanel = false;
  }

  // Handle background clicks to close panels
  onBackgroundClick(event: Event, panelType: string): void {
    event.stopPropagation();
    switch (panelType) {
      case 'friends':
        this.closeFriendsPanel();
        break;
      case 'wing':
        this.closeWingPanel();
        break;
      case 'fighters':
        this.closeFightersPanel();
        break;
      case 'colonisation':
        this.closeColonisationPanel();
        break;
    }
  }

  // Prevent panel content clicks from closing the panel
  onPanelClick(event: Event): void {
    event.stopPropagation();
  }

  // Check if status flag should be shown (active only, except shields)
  shouldShowFlag(section: string, flag: string): boolean {
    const isActive = this.getCurrentStatusValue(section, flag);
    
    // Special case: always show shields (both up and down states)
    if (flag === 'ShieldsUp') {
      return true;
    }
    
    // For all other flags, only show when active
    return isActive;
  }

  // Get status icon class for styling
  getStatusIconClass(section: string, flag: string): string {
    const isActive = this.getCurrentStatusValue(section, flag);
    
    // Special case: shields show active/inactive states
    if (flag === 'ShieldsUp') {
      return isActive ? 'status-active' : 'status-inactive';
    }
    
    // Warning/danger flags that should be red when active
    const warningFlags = [
      'FlightAssistOff', 'HardpointsDeployed', 'SilentRunning', 'SrvHandbrake', 
      'SrvTurretRetracted', 'FsdMassLocked', 'FsdCharging', 'FsdCooldown', 
      'LowFuel', 'OverHeating', 'IsInDanger', 'BeingInterdicted', 'fsdJump', 
      'srvHighBeam', 'LowOxygen', 'LowHealth', 'Cold', 'Hot', 'VeryCold', 'VeryHot'
    ];
    
    if (warningFlags.includes(flag)) {
      return 'status-warning';
    }
    
    // All other flags are shown in green when active
    return 'status-active';
  }

  // Toggle methods
  toggleNavDetails(): void {
    this.showNavDetails = !this.showNavDetails;
  }

  toggleBackpackDetails(): void {
    this.showBackpackDetails = !this.showBackpackDetails;
  }

  toggleCargoDetails(): void {
    this.showCargoDetails = !this.showCargoDetails;
  }

  toggleAllModules(): void {
    this.showAllModules = !this.showAllModules;
  }

  // Friends methods
  getOnlineFriends(): string[] {
    return this.friends?.Online || [];
  }

  getFriendsCount(): number {
    return this.getOnlineFriends().length;
  }

  // Wing methods
  getWingMembers(): any[] {
    return this.wing?.Others || [];
  }

  getWingCount(): number {
    return this.getWingMembers().length;
  }

  // Fighter methods
  getFighters(): any[] {
    return this.shipInfo?.Fighters || [];
  }

  getFightersCount(): number {
    return this.getFighters().length;
  }

  hasFighters(): boolean {
    return this.getFightersCount() > 0;
  }

  formatFighterStatus(status: string): string {
    switch (status) {
      case 'Ready': return 'Ready';
      case 'Launched': return 'Launched';
      case 'BeingRebuilt': return 'Being Rebuilt';
      case 'Idle': return 'Idle';
      default: return status;
    }
  }

  getFighterRebuiltSecondsRemaining(fighter: any): number {
    if (!fighter || !fighter.RebuiltAt) return 0;
    const etaMs = new Date(fighter.RebuiltAt).getTime();
    if (Number.isNaN(etaMs)) return 0;
    const remainingSeconds = Math.ceil((etaMs - this.currentTimeMs) / 1000);
    return remainingSeconds > 0 ? remainingSeconds : 0;
  }

  // Colonisation methods
  isColonisationActive(colonisation: any): boolean {
    return colonisation && colonisation.StarSystem && colonisation.StarSystem !== 'Unknown';
  }

  getColonisationSystem(): string {
    return this.colonisationConstruction?.StarSystem || 'Unknown System';
  }

  getColonisationStatusText(): string {
    if (this.colonisationConstruction?.ConstructionComplete) return 'Complete';
    if (this.colonisationConstruction?.ConstructionFailed) return 'Failed';
    return 'In Progress';
  }

  getColonisationStatusClass(): string {
    if (this.colonisationConstruction?.ConstructionComplete) return 'status-complete';
    if (this.colonisationConstruction?.ConstructionFailed) return 'status-failed';
    return 'status-active';
  }

  getColonisationProgress(): number {
    return this.colonisationConstruction?.ConstructionProgress || 0;
  }

  getColonisationProgressValue(): number {
    return this.getColonisationProgress() * 100;
  }

  getColonisationResources(): any[] {
    return this.colonisationConstruction?.ResourcesRequired || [];
  }

  // Status flag methods
  getCurrentStatusValue(section: string, flag: string): boolean {
    if (!this.currentStatus) return false;
    if (section === 'flags') return Boolean(this.currentStatus.flags?.[flag]);
    if (section === 'flags2') return Boolean(this.currentStatus.flags2?.[flag]);
    return false;
  }

  formatFlagName(flag: string): string {
    return flag.replace(/([A-Z])/g, ' $1').trim();
  }

  getIconForFlag(flag: string): string {
    const iconMap: Record<string, string> = {
      'Docked': 'home',
      'Landed': 'flight_land',
      'LandingGearDown': 'expand_more',
      'ShieldsUp': 'security',
      'Supercruise': 'rocket_launch',
      'FlightAssistOff': 'flight_takeoff',
      'HardpointsDeployed': 'gps_fixed',
      'InWing': 'group',
      'LightsOn': 'lightbulb',
      'CargoScoopDeployed': 'construction', // Better icon for cargo scoop (like a grappler/shovel)
      'SilentRunning': 'volume_off',
      'ScoopingFuel': 'local_gas_station',
      'FsdCharging': 'hourglass_empty', // Hourglass for FSD charging
      'FsdCooldown': 'hourglass_full', // Hourglass for FSD cooldown
      'LowFuel': 'local_gas_station', // Gas station for low fuel
      'OverHeating': 'local_fire_department', // Fire symbol for overheating
      'IsInDanger': 'warning',
      'BeingInterdicted': 'report_problem', // Warning/danger sign for interdiction
      'fsdJump': 'rocket', // Rocket for FSD jump
      'InMainShip': 'rocket',
      'InFighter': 'flight',
      'InSRV': 'directions_car',
      'SrvHandbrake': 'pan_tool',
      'SrvUsingTurretView': 'center_focus_strong',
      'SrvTurretRetracted': 'unfold_less',
      'SrvDriveAssist': 'assistant_direction',
      'FsdMassLocked': 'lock',
      'HasLatLong': 'my_location',
      'HudInAnalysisMode': 'search',
      'NightVision': 'visibility',
      'srvHighBeam': 'highlight'
    };
    return iconMap[flag] || 'info';
  }

  getIconForOdysseyFlag(flag: string): string {
    const iconMap: Record<string, string> = {
      'OnFoot': 'directions_walk',
      'InTaxi': 'local_taxi',
      'InMulticrew': 'group',
      'OnFootInStation': 'business',
      'OnFootOnPlanet': 'public',
      'OnFootInHangar': 'directions_walk', // Use onfoot icon for hangar
      'OnFootSocialSpace': 'directions_walk', // Use onfoot icon for social space
      'OnFootExterior': 'directions_walk', // Use onfoot icon for exterior
      'AimDownSight': 'center_focus_strong',
      'LowOxygen': 'air',
      'LowHealth': 'favorite_border',
      'Cold': 'ac_unit',
      'Hot': 'whatshot',
      'VeryCold': 'severe_cold',
      'VeryHot': 'local_fire_department',
      'GlideMode': 'flight',
      'BreathableAtmosphere': 'air'
    };
    return iconMap[flag] || 'info';
  }

  // Location methods
  getLocationSystem(): string {
    return this.location?.StarSystem || 'Unknown System';
  }

  getLocationDetail(): string {
    if (this.location?.Station) return this.location.Station;
    if (this.location?.Planet) return this.location.Planet;
    if (this.location?.Star) return this.location.Star;
    return '';
  }

  getLocationDetailIcon(): string {
    if (this.location?.Station) return 'business';
    if (this.location?.Planet) return 'public';
    if (this.location?.Star) return 'star';
    return 'location_on';
  }

  // Navigation methods
  hasNavRoute(): boolean {
    return this.navInfo?.NavRoute && Array.isArray(this.navInfo.NavRoute) && this.navInfo.NavRoute.length > 0;
  }

  getNavRouteInfo(): string {
    if (!this.hasNavRoute()) return '';
    const route = this.navInfo.NavRoute;
    const destination = route[route.length - 1]?.StarSystem || 'destination';
    return `${route.length} jumps to ${destination}`;
  }

  getNavRouteDetails(): any[] {
    return this.navInfo?.NavRoute || [];
  }

  getStarClassColor(starClass: string): string {
    const colorMap: Record<string, string> = {
      'O': 'star-o', 'B': 'star-b', 'A': 'star-a', 'F': 'star-f',
      'G': 'star-g', 'K': 'star-k', 'M': 'star-m',
      'L': 'star-l', 'T': 'star-t', 'Y': 'star-y'
    };
    return colorMap[starClass] || 'star-default';
  }

  getStarTypeIcon(starClass: string): string {
    return 'star';
  }

  getJumpDistance(index: number): number {
    const route = this.getNavRouteDetails();
    if (index === 0 || !route[index] || !route[index - 1]) return 0;
    
    const current = route[index].StarPos;
    const previous = route[index - 1].StarPos;
    
    if (!current || !previous) return 0;
    
    const dx = current[0] - previous[0];
    const dy = current[1] - previous[1];
    const dz = current[2] - previous[2];
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // Active mode detection
  getActiveMode(): string {
    if (this.currentStatus?.flags2?.OnFoot) return 'humanoid';
    if (this.currentStatus?.flags?.InSRV) return 'buggy';
    if (this.currentStatus?.flags?.InFighter) return 'fighter';
    return 'mainship';
  }

  // Utility methods
  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  formatNumber(value: number): string {
    return value?.toLocaleString() || '0';
  }

  // Character/Suit methods (for humanoid mode)
  getSuitName(): string {
    const suitName = this.suitLoadout?.SuitName || '';
    const localizedName = this.suitLoadout?.SuitName_Localised || '';
    
    // Check if localized name contains raw key (starts with $ and ends with ;)
    const isRawKey = localizedName.startsWith('$') && localizedName.endsWith(';');
    
    // Map internal suit names to localized display names
    if (suitName.includes('TacticalSuit') || localizedName.includes('TacticalSuit')) {
      return 'Dominator';
    } else if (suitName.includes('UtilitySuit') || localizedName.includes('UtilitySuit')) {
      return 'Maverick';
    } else if (suitName.includes('ExplorationSuit') || localizedName.includes('ExplorationSuit')) {
      return 'Artemis';
    }
    
    // Use localized name only if it's not a raw key
    if (!isRawKey && localizedName) {
      return localizedName;
    }
    
    return this.suitLoadout?.SuitName || 'Unknown Suit';
  }

  getSuitLoadoutName(): string {
    return this.suitLoadout?.LoadoutName || 'Default Loadout';
  }

  getSuitClass(): string {
    const suitName = this.suitLoadout?.SuitName || '';
    const localizedName = this.suitLoadout?.SuitName_Localised || '';
    
    // Determine suit type from both SuitName and SuitName_Localised
    if (suitName.includes('TacticalSuit') || localizedName.includes('TacticalSuit')) {
      return 'tactical';
    } else if (suitName.includes('UtilitySuit') || localizedName.includes('UtilitySuit')) {
      return 'utility';
    } else if (suitName.includes('ExplorationSuit') || localizedName.includes('ExplorationSuit')) {
      return 'exploration';
    }
    
    return 'unknown';
  }

  getSuitClassIcon(): string {
    const suitClass = this.getSuitClass();
    
    switch (suitClass) {
      case 'tactical':
        return 'security'; // Shield/security icon for combat/tactical
      case 'utility':
        return 'build'; // Build/wrench icon for utility/engineering
      case 'exploration':
        return 'explore'; // Explore/compass icon for exploration
      default:
        return 'help_outline'; // Question mark for unknown
    }
  }

  getBackpackItems(category?: string): any[] {
    if (!this.backpack) return [];
    
    if (!category) {
      // Return all items from all categories
      return [
        ...(this.backpack.Items || []),
        ...(this.backpack.Components || []),
        ...(this.backpack.Consumables || []),
        ...(this.backpack.Data || [])
      ];
    }
    
    // Return items from specific category
    switch (category) {
      case 'Items':
        return this.backpack.Items || [];
      case 'Components':
        return this.backpack.Components || [];
      case 'Consumables':
        return this.backpack.Consumables || [];
      case 'Data':
        return this.backpack.Data || [];
      default:
        return [];
    }
  }

  getSuitMods(): any[] {
    return this.suitLoadout?.SuitMods || [];
  }

  getSuitModIcon(mod: any): string {
    // Simple mapping, could be expanded
    return 'build';
  }

  formatModName(mod: any): string {
    let name = '';
    if (typeof mod === 'string') {
      name = mod;
    } else {
      name = mod?.Name || mod?.ModuleName || 'Unknown Mod';
    }
    
    return name.replace(/^suit_/i, '')    // Remove "suit_" prefix (case insensitive)
               .replace(/^weapon_/i, '')  // Remove "weapon_" prefix (case insensitive)
               .replace(/_/g, ' ')        // Replace underscores with spaces
               .trim();
  }

  getSuitWeapons(): any[] {
    return this.suitLoadout?.Modules?.filter((module: any) => 
      module.SlotName?.includes('Weapon') || module.SlotName?.includes('weapon')
    ) || [];
  }

  getWeaponType(weapon: any): string {
    const name = weapon.ModuleName || weapon.Item || '';
    if (name.includes('Kinetic')) return 'Kinetic';
    if (name.includes('Laser')) return 'Laser';
    if (name.includes('Plasma')) return 'Plasma';
    return 'Unknown';
  }

  formatWeaponSlot(slotName: string): string {
    return slotName?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown Slot';
  }

  // Ship methods (for ship modes)
  getShipName(): string {
    return this.shipInfo?.Name || 'Unnamed Ship';
  }

  getShipType(): string {
    return this.shipInfo?.Type || 'Unknown Ship';
  }

  getShipIdent(): string {
    return this.shipInfo?.ShipIdent || 'Unknown';
  }

  getLandingPadSize(): string {
    return this.shipInfo?.LandingPadSize || '?';
  }

  getShipHealth(): string {
    const hull = this.currentStatus?.Hull;
    return hull ? `${(hull * 100).toFixed(0)}%` : '100%';
  }

  getShipHealthPercentage(): number {
    return (this.currentStatus?.Hull || 1) * 100;
  }

  getFuelAmount(): string {
    const fuel = this.shipInfo?.FuelMain || this.currentStatus?.Fuel?.FuelMain || 0;
    return fuel.toFixed(1);
  }

  getFuelCapacity(): string {
    const capacity = this.shipInfo?.FuelMainCapacity || 0;
    return capacity.toFixed(1);
  }

  getFuelPercentage(): number {
    const current = this.shipInfo?.FuelMain || this.currentStatus?.Fuel?.FuelMain || 0;
    const capacity = this.shipInfo?.FuelMainCapacity || 1;
    return (current / capacity) * 100;
  }

  getCargoCapacity(): number {
    return this.shipInfo?.CargoCapacity || this.cargo?.Capacity || 0;
  }

  getCargoAmount(): number {
    return this.cargo?.TotalItems || 0;
  }

  getCargoPercentage(): number {
    const capacity = this.getCargoCapacity();
    if (capacity === 0) return 0;
    return (this.getCargoAmount() / capacity) * 100;
  }

  getCargoItems(): any[] {
    return this.cargo?.Inventory || [];
  }

  hasCargoItems(): boolean {
    return this.getCargoItems().length > 0;
  }

    getMaxJumpRange(): number {
    return this.shipInfo?.MaximumJumpRange || 0;
  }
    getMinJumpRange(): number {
    return this.shipInfo?.MinimumJumpRange || 0;
  }
    getCUrJumpRange(): number {
    return this.shipInfo?.CurrentJumpRange || 0;
  }

  getShipRebuy(): number {
    // Rebuy is not tracked in ShipInfo projection, would need to be from Loadout event
    return this.loadout?.Rebuy || 0;
  }








  private readonly SHIP_ASSET_DIR = 'assets/ship/ext';
  private readonly FALLBACK_IMG   = `${this.SHIP_ASSET_DIR}/unknown_ship.png`;

  private readonly SHIP_IMAGE_MAP: Record<string, string> = { // adding ship only if ui dont work
      'Fer-de-Lance': 'ferdelance',
      'Krait Phantom': 'krait_light',
      'Viper Mk III': 'viper_mk_iii',
      'diamondbackxl': 'd_scout_expl',
      'diamondback': 'd_scout_expl',
      'asp_scout': 'asp_scout_exp',
      'asp': 'asp_scout_exp',
      'federation_dropship': 'federation_dropship',
      'federation_dropship_mkii': 'federation_dropship_mkii',
      'federation_gunship':'federation_gunship',
      'empire_trader': 'empire_trader',
      'empire_eagle': 'empire_eagle',
      'empire_courier': 'empire_courier',
      'cutter': 'cutter',
      'typex_2':'typex_2',
      'typex_3':'typex_3',
      'python_nx':'python_nx',
      'krait_light':'krait_light'
  };


  leftBadges: Array<{ label: string; icon?: string }> = [
    { label: 'HULL' },        // -> assets/ship/int/hull.png
    { label: 'FSD' },     // -> assets/ship/int/shields.png
    { label: 'SENSOR' },        // -> assets/ship/int/fuel.png
    { label: 'CARGO' },       // -> assets/ship/int/cargo.png
  ];
  shipImgSrc: string = this.FALLBACK_IMG;

  
  private slugifyShipType(raw: string): string {
    if (!raw) return 'unknown_ship';
    return raw.trim().toLowerCase()
      .replace(/[^a-z0-9 \-]+/g, '')   // keep letters/numbers/space/dash
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_');
  }

  updateShipImage(): void {
    const type = this.getShipType();
    const base = this.SHIP_IMAGE_MAP[type] ?? this.slugifyShipType(type);
    // cache-bust by type so the <img> refreshes on change
    this.shipImgSrc = `${this.SHIP_ASSET_DIR}/${base}.png?v=${encodeURIComponent(type)}`;
    
  }
  onShipImgError(ev: Event): void {
    const img = ev.target as HTMLImageElement | null;
    if (img && !img.src.includes('/unknown_ship.png')) {
      img.src = this.FALLBACK_IMG + `?v=${Date.now()}`;
      
    }
  }














  
  getCurrentBalance(): number {
    return this.currentStatus?.Balance || 0;
  }

  // Module methods
  getShipModules(): any[] {
    return this.loadout?.Modules || [];
  }

  getCoreModules(): any[] {
    return this.getShipModules().filter(module => {
      const slot = module?.Slot || '';
      // Core modules have specific slot names
      return slot === 'PowerPlant' || slot === 'MainEngines' || 
             slot === 'FrameShiftDrive' || slot === 'LifeSupport' ||
             slot === 'PowerDistributor' || slot === 'Radar' ||
             slot === 'FuelTank' || slot === 'Armour';
    });
  }

  getOptionalModules(): any[] {
    return this.getShipModules().filter(module => {
      const slot = module?.Slot || '';
      // Optional modules are typically named Slot01_Size2, Slot02_Size3, etc.
      return slot.includes('Slot') && 
             !slot.includes('TinyHardpoint') &&
             !slot.includes('Hardpoint') &&
             !this.getCoreModules().some(core => core.Slot === slot);
    });
  }

  getUtilityModules(): any[] {
    const utilityModules = this.getShipModules().filter(module => {
      const slot = module?.Slot || '';
      // Utility slots are typically named TinyHardpoint1, TinyHardpoint2, etc.
      return slot.includes('TinyHardpoint') || slot.includes('Utility');
    });
    return utilityModules;
  }

  getWeaponModules(): any[] {
    return this.getShipModules().filter(module => {
      const slot = module?.Slot || '';
      // Weapon hardpoints are typically named SmallHardpoint1, MediumHardpoint1, LargeHardpoint1, HugeHardpoint1, etc.
      return slot.includes('Hardpoint') && !slot.includes('TinyHardpoint');
    });
  }

  getVisibleModulesCount(): number {
    return 10; // Show first 10 modules by default
  }

  formatModuleName(item: string): string {
    return item?.replace(/^hpt_/i, '') // Remove "hpt_" prefix (case insensitive)
               .replace(/^int_/i, '') // Remove "int_" prefix (case insensitive)
               .replace(/_/g, ' ')      // Replace underscores with spaces
               .replace(/([A-Z])/g, ' $1') // Add space before capital letters
               .trim() || 'Unknown Module';
  }

  formatSlotName(slot: string): string {
    return slot?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown Slot';
  }

  // Debug method for troubleshooting
  debugModules(): void {
    console.log('=== MODULE DEBUG INFO ===');
    console.log('Total modules:', this.getShipModules().length);
    console.log('Core modules:', this.getCoreModules().length);
    console.log('Optional modules:', this.getOptionalModules().length);
    console.log('Utility modules:', this.getUtilityModules().length);
    console.log('Weapon modules:', this.getWeaponModules().length);
    console.log('Loadout data:', this.loadout);
  }

  // Constants
  readonly INFORMATION_TAB = 'info';
} 