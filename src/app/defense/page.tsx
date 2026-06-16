// Defense Systems is taken down for now. Redirect any direct visits to the
// Technologies section. To restore, swap this back to:
//   export { default } from '@/components/DefenseSector/DefensePage';
import { redirect } from 'next/navigation';

export default function DefensePage() {
  redirect('/technologies');
}
