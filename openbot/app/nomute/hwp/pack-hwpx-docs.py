# hwpx-docs 를 브라우저 파이썬(Pyodide)에 풀 묶음으로 — 코드와 자료만(시험 파일 · 그림 · 캐시 뺌) · 고치지 않음
import os, sys, zipfile
src, out, sha = sys.argv[1], sys.argv[2], sys.argv[3]
drop_ext = {'.pyc', '.log', '.png'}
names = []
for top in ('lib', 'presets', 'templates'):
    for d, ds, fs in os.walk(os.path.join(src, top)):
        ds[:] = sorted(x for x in ds if x not in ('__pycache__', 'fixtures'))
        for f in sorted(fs):
            if os.path.splitext(f)[1] not in drop_ext:
                names.append(os.path.relpath(os.path.join(d, f), src))
names += ['LICENSE']
notice = (f"hwpx-docs 0.3.0 — https://github.com/BlackBuddle/hwpx-docs (commit {sha})\n"
          "Copyright (C) 2026 BlackBuddle · GNU AGPL-3.0-or-later (LICENSE)\n"
          "Unmodified source files (lib · presets · templates). Tests, fixtures and images are left out.\n")
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for n in names:
        zi = zipfile.ZipInfo(n, (2026, 11, 16, 0, 0, 0)); zi.compress_type = zipfile.ZIP_DEFLATED; zi.external_attr = 0o644 << 16
        z.writestr(zi, open(os.path.join(src, n), 'rb').read())
    zi = zipfile.ZipInfo('NOTICE.txt', (2026, 11, 16, 0, 0, 0)); zi.compress_type = zipfile.ZIP_DEFLATED; zi.external_attr = 0o644 << 16
    z.writestr(zi, notice)
print(len(names) + 1, 'files', os.path.getsize(out), 'bytes')
