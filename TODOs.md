# TODOs - eonia-atlas

## High Priority

- [ ] Implement base world map rendering with Leaflet/Mapbox
  - Rationale: Core functionality required for the atlas application to display geographic data
- [ ] Add pin placement and clustering functionality
  - Rationale: Enables users to visualize multiple locations and prevents UI clutter at high zoom levels
- [ ] Create marker popup information display
  - Rationale: Allows users to view detailed information about specific locations without navigation
- [ ] Set up data structure for location metadata
  - Rationale: Provides foundation for storing and managing location data consistently

## Medium Priority

- [ ] Add search and filter capabilities
  - Rationale: Improves user experience by allowing quick access to specific locations
- [ ] Implement map zoom and pan controls
  - Rationale: Essential for intuitive map navigation and exploration
- [ ] Create responsive mobile layout
  - Rationale: Ensures accessibility across devices and increases user base reach
- [ ] Add location import/export features
  - Rationale: Enables data portability and integration with external systems

## Lower Priority

- [ ] Custom map styling and themes
  - Rationale: Enhances visual branding and user experience customization
- [ ] Performance optimization and caching
  - Rationale: Improves load times and reduces server strain as data scales
- [ ] Unit and integration tests
  - Rationale: Ensures code reliability and reduces bugs in production
- [ ] Documentation and user guide
  - Rationale: Facilitates user adoption and reduces support overhead

## New Ideas

- [ ] Integrate text-driven game mechanics
    - Rationale: Leverage existing Next.js + TypeScript stack with React state management for interactive storytelling
    - Suggested approach: State machine pattern for scene/choice/inventory management, localStorage for session saves
    - Consider: Single-player progression first; add auth + database (Supabase) only if cross-device persistence needed
- [ ] Add location-based narrative content
    - Rationale: Combine map pins with story triggers to create immersive geographic storytelling experiences
- [ ] Implement interactive tutorials and guided tours
    - Rationale: Help users learn map features through step-by-step interactive walkthroughs