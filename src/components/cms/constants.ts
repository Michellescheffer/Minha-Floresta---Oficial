// Professional Glass Style
export const cmsTokens = {
    // Layout
    sectionSpacing: 'px-6 sm:px-8 lg:px-12',

    // Components
    glass: 'bg-white border border-gray-200 shadow-sm rounded-xl', // Matches variant="solid"
    subtleGlass: 'bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors',
    card: 'bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-all duration-300',

    // Typography
    heading: 'text-xs uppercase tracking-wider text-gray-500 font-semibold',
    label: 'text-sm text-gray-700 font-medium',

    // Forms
    input: 'w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm placeholder:text-gray-400 text-gray-900',

    button: {
        primary: 'inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 active:translate-y-0',
        secondary: 'inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white/80 border border-white/60 text-gray-800 font-semibold hover:bg-white hover:border-white focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm backdrop-blur-md hover:shadow-md hover:-translate-y-0.5 active:scale-95 active:translate-y-0'
    }
};
