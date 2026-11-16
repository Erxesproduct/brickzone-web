/**
 * Business facts from brickzone.mn (Zochil shop 28792: shop, checkout, delivery, FAQ and «Бидний тухай» pages)
 * and the Facebook page «Brickzone», read on 2026-11-16. Nothing here is invented; open questions are listed
 * in docs/erxes/MANUAL-STEPS.md.
 */
export const business = {
  name: "Brickzone",
  tagline: "LEGO, RC, MOC загварын хобби дэлгүүр",
  description:
    "Brickzone нь LEGO болон техник сэтгэлгээг хөгжүүлэх RC, MOC загваруудыг сонирхогчдод зориулсан хобби дэлгүүр юм.",
  phone: { display: "9110-8708", tel: "+97691108708" },
  email: "uee.brickzone@gmail.com",
  address: "Баруун 4 зам, ТБД Андууд Старс төв, Б заал, 4 давхар, 28 тоот",
  hours: "Өдөр бүр 10:00–19:00",
  /** No coordinates on Zochil: the map link searches the building name. */
  mapUrl: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Anduud Stars center, Ulaanbaatar"),
  facebook: "https://www.facebook.com/profile.php?id=100057832193346",
  instagram: "https://www.instagram.com/brickzone_mn/",
  payments: [{ id: "qpay", name: "QPay", note: "Аль ч банкны аппаар QR уншуулж төлнө" }],
  /**
   * Zochil has one delivery option, «Улаанбаатар хот болон орон нутаг», 8,000₮, free from 250,000₮
   * (delivery_price_limit). Countryside orders are put on the bus (FAQ).
   */
  freeFrom: 250000,
  delivery: [
    { id: "city", name: "Улаанбаатар хот", fee: 8000, note: "24–48 цагийн дотор хаягт хүргэнэ" },
    { id: "countryside", name: "Орон нутаг", fee: 8000, note: "Таны заасан унаанд тавьж өгнө" },
  ],
  rules: {
    payment: "Төлбөрөө QPay-ээр төлснөөр захиалга баталгаажна. Хаан банк, Төрийн банкны дансаар шилжүүлж болно.",
    installment: "SocialPay болон ArdPay-ээр 6 хуваан төлөх боломжтой: захиалгын тайлбарт бичих эсвэл утсаар холбогдоно уу.",
    delivery: "Захиалга өгснөөс хойш 24 цагийн дотор хүргэлтэд гаргаж, 24–48 цагийн дотор хүргэнэ.",
    countryside: "Орон нутгаас захиалсан барааг таны заасан унаанд тавьж өгнө.",
    ebarimt: "Бүх захиалгад и-баримт олгоно. Байгууллагаар авах бол байгууллагын регистрийн дугаараа бичнэ үү.",
  },
} as const;

export type DeliveryId = (typeof business.delivery)[number]["id"];
export const deliveryOption = (id: DeliveryId) => business.delivery.find((d) => d.id === id)!;

/** Delivery fee for an order: 8,000₮, free once the goods reach 250,000₮. */
export const deliveryFee = (id: DeliveryId, subtotal: number) => (subtotal >= business.freeFrom ? 0 : deliveryOption(id).fee);
