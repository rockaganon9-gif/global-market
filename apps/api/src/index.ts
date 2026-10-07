import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
import { adminRouter } from "./routes/admin.routes";
import { authRouter } from "./routes/auth.routes";
import { cartRouter } from "./routes/cart.routes";
import { categoryRouter } from "./routes/category.routes";
import { orderRouter } from "./routes/order.routes";
import { paymentRouter } from "./routes/payment.routes";
import { productRouter } from "./routes/product.routes";
import { themeRouter } from "./routes/theme.routes";
import { vendorRouter } from "./routes/vendor.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Images produits téléversées, servies statiquement (ex: /uploads/basket.jpg).
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/auth", authRouter);
app.use("/vendors", vendorRouter);
app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/payments", paymentRouter);
app.use("/admin", adminRouter);
app.use("/themes", themeRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`API Global Market démarrée sur http://localhost:${port}`);
});
