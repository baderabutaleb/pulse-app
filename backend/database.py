import os
from dotenv import load_dotenv

load_dotenv()


class _SupabaseProxy:
    """Defers client creation to first use so the server boots without env vars set."""

    _client = None

    def _get(self):
        if self._client is None:
            from supabase import create_client

            self._client = create_client(
                os.environ["SUPABASE_URL"],
                os.environ["SUPABASE_KEY"],
            )
        return self._client

    def table(self, *args, **kwargs):
        return self._get().table(*args, **kwargs)


supabase = _SupabaseProxy()
