import { ApiClient, ApiClientError } from '../api/ApiClient';
import { GoogleAuth } from '../auth/GoogleAuth';
import { GameApp } from './GameApp';
import { Shell } from '../ui/Shell';

export async function boot() {
  const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
  const root = document.querySelector<HTMLElement>('#ui-root');
  if (!canvas || !root) throw new Error('TinyWorld shell is incomplete');
  const api = new ApiClient();
  const shell = new Shell(root);
  let game: GameApp | null = null;

  const enter = async () => {
    shell.setState('entering', 'Growing your TinyWorld…');
    const bootstrap = await api.bootstrap();
    shell.setState('playing');
    game?.destroy();
    game = new GameApp(canvas, shell.hud, api);
    game.start(bootstrap);
  };

  shell.onGoogle(async () => {
    try {
      shell.setState('entering', 'Opening Google sign-in…');
      const auth = new GoogleAuth(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
      const credential = await auth.signIn();
      await api.googleCredential(credential);
      await enter();
    } catch (error) { shell.setState('signed-out', error instanceof Error ? error.message : 'Sign-in failed'); }
  });

  try { await api.me(); await enter(); }
  catch (error) {
    if (error instanceof ApiClientError && error.status === 401) shell.setState('signed-out', 'Sign in to save your TinyWorld across devices.');
    else shell.fatal('TinyWorld could not connect. Check your connection and try again.');
  }
}
