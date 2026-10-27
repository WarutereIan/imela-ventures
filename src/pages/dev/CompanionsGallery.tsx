import Companion, { type CompanionMood, type CompanionPose, type CompanionVariant } from '../../components/characters/Companion';
import Scene, { type SceneEnvironment } from '../../components/characters/Scene';

const variants: CompanionVariant[] = ['pebble', 'cloud', 'sprout', 'heart', 'bloom', 'drift'];
const moods: CompanionMood[] = ['calm', 'anxious', 'grieving', 'frustrated', 'lonely', 'tired', 'recovering', 'hopeful', 'curious', 'uncertain', 'joyful'];
const poses: CompanionPose[] = ['idle', 'wave', 'reach', 'hug', 'hold'];
const envs: SceneEnvironment[] = ['sky', 'meadow', 'dusk', 'scribble', 'room', 'sunrise'];

/** Development-only design reference for the companion system (not routed in production builds). */
export default function CompanionsGallery() {
  return (
    <section className="shell section space-y-12">
      <h1 className="font-display text-display-md">Companion system</h1>
      <div className="grid grid-cols-3 gap-6 sm:grid-cols-6">
        {variants.map((v) => (
          <figure key={v} className="text-center">
            <Companion variant={v} mood="hopeful" pose="wave" size={120} />
            <figcaption className="text-sm">{v}</figcaption>
          </figure>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6 sm:grid-cols-6 lg:grid-cols-11">
        {moods.map((m) => (
          <figure key={m} className="text-center">
            <Companion variant="pebble" mood={m} size={100} />
            <figcaption className="text-xs">{m}</figcaption>
          </figure>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-6">
        {poses.map((p) => (
          <figure key={p} className="text-center">
            <Companion variant="sprout" mood="joyful" pose={p} size={100} />
            <figcaption className="text-xs">{p}</figcaption>
          </figure>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {envs.map((e, i) => (
          <Scene key={e} environment={e} framed className="h-56">
            <div className="flex h-56 items-end justify-center pb-2">
              <Companion variant={variants[i]} mood={moods[i + 3]} pose={poses[i % 5]} size={130} />
            </div>
          </Scene>
        ))}
      </div>
    </section>
  );
}
