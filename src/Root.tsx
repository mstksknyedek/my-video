import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import { KisacasiShort } from "./kisacasi/KisacasiShort";
import { KarakterOnizleme } from "./kisacasi/karakterler/KarakterOnizleme";
import { MesajEkraniOnizleme } from "./kisacasi/MesajEkraniOnizleme";
import { Video01AileGrubu } from "./kisacasi/videolar/Video01AileGrubu";
import { Video01SesliMesaj } from "./kisacasi/videolar/Video01SesliMesaj";
import { Video02Sinek } from "./kisacasi/videolar/Video02Sinek";
import { Video07DugunTakiDefteri } from "./kisacasi/videolar/Video07DugunTakiDefteri";
import { Video06KarincaDogdun } from "./kisacasi/videolar/Video06KarincaDogdun";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Kisacasi">
        <Composition
          id="KisacasiShort"
          component={KisacasiShort}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="KarakterOnizleme"
          component={KarakterOnizleme}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="AileGrubuAnimatik"
          component={MesajEkraniOnizleme}
          durationInFrames={780}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="Video01AileGrubu"
          component={Video01AileGrubu}
          durationInFrames={849}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="Video01SesliMesaj"
          component={Video01SesliMesaj}
          durationInFrames={672}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="Video02Sinek"
          component={Video02Sinek}
          durationInFrames={780}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="Video07DugunTakiDefteri"
          component={Video07DugunTakiDefteri}
          durationInFrames={684}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="Video06KarincaDogdun"
          component={Video06KarincaDogdun}
          durationInFrames={690}
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>
      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        // You can take the "id" to render a video:
        // bunx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />

    </>
  );
};
