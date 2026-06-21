// Defense Systems is taken down for now. Redirect any direct visits to the
// Technologies section.
import { redirect } from 'next/navigation';

export default function DefensePage() {
  redirect('/technologies');
}
