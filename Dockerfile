# FROM ubuntu
FROM node:18.16.0-alpine AS builder

# RUN apk add git; \
#     apk add openssh; \
#     apk add openssh-client; \
#     apk add openrc; \
#     apk add zip; \
#     apk add tzdata;
# RUN zip -r -0 /zoneinfo.zip /usr/share/zoneinfo
# RUN apk add --no-cache bash
#

ARG CMD_NAME
# ARG SSH_PRIVATE_KEY
# ARG BB_APP
# ARG BB_APP_PW
ARG BUILD_VERSION

# ARG DB_USERNAME
# ARG DB_PASSWORD
# ARG DB_HOST
# ARG DB_NAME
# ARG ACCESS_TOKEN_JWT
# ARG REFRESH_TOKEN_JWT
ARG API_URL
ENV API_URL=${API_URL}
# RUN echo "machine api.bitbucket.org" >>  /root/.netrc
# RUN echo "  login ${BB_APP}" >>  /root/.netrc
# RUN echo "  password ${BB_APP_PW}" >>  /root/.netrc


#RUN mkdir -p /root/.ssh && \
#    echo "${SSH_PRIVATE_KEY}" > /root/.ssh/id_rsa && \
#    chmod 600 /root/.ssh/id_rsa && \
#    ssh-keyscan bitbucket.org > /root/.ssh/known_hosts

# RUN #/etc/init.d/sshd restart; exit 0


# Set necessary environmet variables needed for our image

# Move to working directory /build
ENV WORK_HOME="app"
ENV CMD_NAME=${CMD_NAME}
WORKDIR /$WORK_HOME
COPY . /$WORK_HOME
# Copy the code into the container

# RUN chmod +x /$WORK_HOME/config.sh
# RUN /bin/bash /$WORK_HOME/config.sh "${API_URL}"

RUN cd /$WORK_HOME &&\
    yarn

ENV PATH="/root/.yarn/bin:${PATH}"

ARG ENV
ENV ENV="${ENV}"

RUN cd /$WORK_HOME &&\
    yarn global add @quasar/cli && \
    quasar build


WORKDIR /build

ARG API_URL
ENV API_URL=${API_URL}

RUN cp -r /$WORK_HOME/dist/spa/* /build/


FROM nginx:alpine as server

COPY --from=builder /build/  /var/www/html/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
