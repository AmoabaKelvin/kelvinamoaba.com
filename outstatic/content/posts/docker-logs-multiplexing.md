---
title: 'Logs Multiplexing in Docker'
seoTitle: 'Logs Multiplexing in Docker'
datePublished: Thu Oct 16 2025 10:00:00 GMT+0000 (Coordinated Universal Time)
publishedAt: '2025-10-16T10:00:00.000Z'
slug: docker-logs-multiplexing
cover: ''
tags: docker, logs, multiplexing
status: 'published'
author:
  picture: ''
---

Logs multiplexing is the way that docker sends logs from containers to whatever client might be requesting for those logs. Logs multiplexing is when the various data from the output streams of the process being run in the container is combined into one stream and passed to clients.

### The Problem Docker Tried to Solve

Whenever programs are being executed, there are 2 available streams on which they can channel results / outputs to, we have the standard output (`stdout`) and the standard error (`stderr`); there is standard error but that is mostly for receiving inputs into programs. Whenever you run the command like `docker logs <container>` the problem was now how docker is going to ensure that those outputs from the different streams arrive in the exact order they were being produced inside the container and also making sure that the different streams could be identified by the clients making the request to view those logs.

The naive approach could be managing two different networks on which results from stdout could be passed on one and the results from stderr could also be passed on the other. But then that would mean managing two different network streams and the whole complexity associated with that. Assuming one network stream goes down, what happens? How do we keep track of the order that the outputs were produced, these among many more reasons are the reason for multiplexing.

### Muliplexer

In electronics, a multiplexer looks like something like this.

![Multiplexer](https://people.iitism.ac.in/~sarun/notes/phc504/figs/mux.jpg)

[Image source](https://people.iitism.ac.in/~sarun/notes/phc504/figs/mux.jpg)

From the simple eye view, you can see that there are a number of input streams that are combined to form one output. You can think of docker logs multiplexing as the same concept, combining the various streams into one single stream.

### Decoding the Multiplexed Stream

Docker uses a simple framing protocol. Each chunk of data gets prefixed with an 8-byte header. The first byte identifies which stream it came from (0 for stdin, 1 for stdout, 2 for stderr), and the next bytes specify how many bytes of data follow.

The header looks like this:

```
[STREAM_TYPE] [0x00, 0x00, 0x00] [PAYLOAD_SIZE]
```

Using the `payload_size`, we can directly fetch the exact content in the stream coming in.

This framing header lets the receiving end parse the stream unambiguously. The data stays intact and in order, but now it's carrying metadata about its origin. When you use commands like docker logs, you're actually reading from this multiplexed stream that Docker has stored. Docker can show you just stdout, just stderr, or both together because it knows which bytes came from which stream thanks to that multiplexing metadata.

### Breakdown of the 8-byte header

```shell
Byte 0 : Stream type (0 = stdin, 1 = stdout, 2 = stderr)
Bytes 1-3 : Reserved (always 0x00)
Bytes 4-7 : Payload size (big-endian uint32)
Bytes 8-n : Payload (the actual log data)
```
