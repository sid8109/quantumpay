-- CreateTable
CREATE TABLE "webSocketConnection" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "socketId" TEXT NOT NULL,

    CONSTRAINT "webSocketConnection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "webSocketConnection" ADD CONSTRAINT "webSocketConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
