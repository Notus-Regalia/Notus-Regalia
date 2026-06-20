// Branded 404 page. A missing page isn't an error/maintenance state, so it
// keeps the brand look but says "Page Not Found" with a route home.
import StatusScreen from "@/components/ui/StatusScreen";

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      title="Page Not Found"
      description="The page you're looking for doesn't exist or may have moved. Let's get you back to operational ground."
      action={
        <a className="nr-cta" href="/">
          Back to Homepage
        </a>
      }
    />
  );
}
