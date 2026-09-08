import { Fragment } from "react";
import SlideScreen from "@/components/ui/SlideScreen";

export default function ThankYouScreen() {
  return (
    <SlideScreen
      justify="top"
      lines={[
        <Fragment key="thanks">
          Thank you for completing this study. Your responses have been recorded. We appreciate you taking the time to share your
          honest perspective on virtual meetings &mdash; it genuinely helps this research.
        </Fragment>,
        <Fragment key="close">You may close this window now.</Fragment>,
      ]}
    />
  );
}
