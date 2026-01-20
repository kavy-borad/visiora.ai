// Simple mutable state to coordinate loaders across client-side navigations
// This helps distinguish between a full page reload (where this resets to false)
// and a SPA navigation (where we can explicitly set this to true)

export const navigationState = {
    shouldShowLoader: false
};
