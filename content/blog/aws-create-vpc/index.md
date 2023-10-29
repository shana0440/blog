---
title: AWS Create VPC
date: "2023-10-29T00:24:49.925Z"
description: "Remind me how to create a new VPC on AWS"
tags: ["writing", "aws", "vpc"]
private: true
---

This post is about me create a new VPC on AWS for my production environment.

To create a VPC, we need several component to make VPC works

- Subnet
  - Subnet is used to separate network, so we can expose some of the service to public, and keep some service in private. For example, we want our web service is public so people can visit our website, but we want database is private so only our service can access database.
- Network interface
  - Network interface is like network card, it can attach to the subnet, give the subnet ability to connect to network.
- Internet gateway
  - Internet gateway give the VPC ability to connect to public internet, but it need help of Route table.
- Route table
  - Route table define how packets are forwarded between the subnets, so we can forward packet to public internet, or forward packet from public internet to our subnet.

If subnet have internet gateway, that mean it is public subnet, because it have the ability to connect to internet.
Every server in public subnet will have a public IP, so we can access that service.

## References

- https://docs.aws.amazon.com/vpc/latest/userguide/create-vpc.html