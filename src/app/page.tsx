import { Experience } from '@/components/cinematic/Experience';
import { Opening } from '@/components/sections/Opening';
import { Act03Axis } from '@/components/sections/Act03Axis';
import { Act04Experiences } from '@/components/sections/Act04Experiences';
import { Act05Nations } from '@/components/sections/Act05Nations';
import { Act06WhyUAE } from '@/components/sections/Act06WhyUAE';
import { Act07Economy } from '@/components/sections/Act07Economy';
import { Act08Partnership } from '@/components/sections/Act08Partnership';
import { Act09Network } from '@/components/sections/Act09Network';
import { Act10Invitation } from '@/components/sections/Act10Invitation';

export default function Page() {
  return (
    <Experience>
      <Opening />
      <Act03Axis />
      <Act04Experiences />
      <Act05Nations />
      <Act06WhyUAE />
      <Act07Economy />
      <Act08Partnership />
      <Act09Network />
      <Act10Invitation />
    </Experience>
  );
}
