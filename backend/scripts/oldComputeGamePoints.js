// Compute games points
/*     const result1 = await db.collection("games").updateMany({}, [
      {
        $set: {
          points: {
            $add: [
              {
                $cond: {
                  if: { $eq: ["$isVictory", true] },
                  then: victoryBase,
                  else: defeatBase,
                },
              },
              {
                $multiply: [
                  { $arrayElemAt: ["$score.life", 0] },
                  victoryLifeBonus,
                ],
              },
              {
                $multiply: [
                  {
                    $add: [
                      { $arrayElemAt: ["$score.life", 1] },
                      { $arrayElemAt: ["$score.life", 2] },
                      { $arrayElemAt: ["$score.life", 3] },
                    ],
                  },
                  defeatLifeMalus,
                ],
              },
            ],
          },
        },
      },
    ]);
    console.log(`Games modified: ${result1.modifiedCount}`); */
