FROM node:18 AS builder
WORKDIR /usr/app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json .
COPY src ./src

RUN npm run build

FROM node:18
ENV EXIFTOOL_VERSION 12.60

# Install exiftool: https://exiftool.org/install.html#Unix
RUN wget -O exiftool.tar.gz "https://exiftool.org/Image-ExifTool-${EXIFTOOL_VERSION}.tar.gz" && \
  tar -xvf exiftool.tar.gz && \
  cd Image-ExifTool-${EXIFTOOL_VERSION} && \
  perl Makefile.PL && \
  make && \
  make test && \
  make install && \
  cd .. \
  rm exiftool.tar.gz

# Fix "detected dubious ownership" issue:
# https://github.com/actions/runner-images/issues/6775#issuecomment-1410270956
# https://github.com/actions/checkout/issues/1169
RUN git config --system --add safe.directory /github/workspace

WORKDIR /usr/app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/app/lib ./lib

CMD ["node", "/usr/app/lib/main.js"]
