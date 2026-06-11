// Optional catch-all so clean Info Center paths like
// /information/newsroom/releases resolve server-side. "/information"
// matches with no slug. The client resolves/validates the tab+subtab.
export { default } from '@/components/InformationCenter';
