import os
import pickle as pkl

_model = None


def _load():
    global _model
    if _model is None:
        model_path = os.path.join(os.path.dirname(__file__), 'my_model_stream_pre.pkl')
        with open(model_path, 'rb') as f:
            _model = pkl.load(f)
    return _model


class _ModelProxy:
    def __getattr__(self, name):
        return getattr(_load(), name)


model = _ModelProxy()
