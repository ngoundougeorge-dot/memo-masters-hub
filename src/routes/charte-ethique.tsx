import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Award, ArrowLeft, CheckCircle2, ShieldCheck, Scale, Compass, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/charte-ethique")({
  head: () => ({
    meta: [
      { title: "Charte Éthique & Déontologie Académique — MémoirePro Gabon" },
      {
        name: "description",
        content:
          "Charte éthique, engagement anti-plagiat et déontologie scientifique conforme aux exigences du CAMES et des universités gabonaises.",
      },
    ],
  }),
  component: CharteEthiquePage,
});

function CharteEthiquePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* En-tête */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:py-4">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="font-serif text-xl font-semibold tracking-tight text-primary">
              MémoirePro Gabon
            </span>
          </Link>

          <Link to="/">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Retour à l'accueil</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1 py-10 sm:py-16 px-4">
        <article className="mx-auto max-w-4xl space-y-8 bg-card border border-border/80 rounded-2xl p-6 sm:p-12 shadow-sm">
          <div className="space-y-3 border-b border-border/80 pb-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs gap-1">
                <Scale className="h-3.5 w-3.5" />
                Déontologie Scientifique & Standards CAMES
              </Badge>
              <span className="text-xs text-muted-foreground">
                Document de Référence 2026
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Charte Éthique & Déontologie de la Recherche Académique
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Principes d'intégrité intellectuelle, normes de rigueur scientifique et engagements méthodologiques régissant l'accompagnement des mémoires et thèses au Gabon.
            </p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            {/* Préambule */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                Préambule : La Recherche d'Excellence au Service du Gabon
              </h2>
              <p>
                L'enseignement supérieur en République Gabonaise exige des standards d'excellence conformes aux directives du <strong>Conseil Africain et Malgache pour l'Enseignement Supérieur (CAMES)</strong>. MémoirePro Gabon a été conçu avec la conviction profonde que tout travail de fin d’études doit constituer une véritable contribution intellectuelle et empirique.
              </p>
              <p>
                La présente charte énonce les engagements moraux, scientifiques et légaux réciproques entre notre collège de rédacteurs académiques et les candidats que nous accompagnons.
              </p>
            </section>

            {/* Engagement 1 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                1. Tolérance Zéro pour le Plagiat & Contrôle Turnitin
              </h2>
              <p>
                Le plagiat constitue une faute déontologique majeure. MémoirePro Gabon applique une politique d'intégrité absolue :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Tout mémoire, thèse ou rapport produit est une <strong>œuvre originale et inédite</strong>, rédigée sur mesure selon le protocole de recherche défini.</li>
                <li>Tout emprunt textuel, conceptuel ou statistique fait l'objet d'une citation explicite entre guillemets accompagnée de sa référence bibliographique complète (auteur, année, page).</li>
                <li>Le manuscrit final est systématiquement audité par les moteurs <strong>Turnitin et Compilatio Magister</strong>. Le rapport officiel certifiant un taux de similarité inférieur à 5% est délivré à l'étudiant.</li>
              </ul>
            </section>

            {/* Engagement 2 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary" />
                2. Encadrement Strict de l'Intelligence Artificielle
              </h2>
              <p>
                Si les technologies d'intelligence artificielle peuvent assister le traitement documentaire préliminaire, <strong>la production brute ou automatisée par IA est formellement bannie</strong> :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Chaque paragraphe est formulé, argumenté et validé par un rédacteur humain diplômé de troisième cycle (Docteur ou Titulaire de Master 2 de recherche).</li>
                <li>Chaque source mentionnée est physiquement vérifiée dans des revues scientifiques authentifiées (Cairn.info, JSTOR, Revues CAMES, Google Scholar).</li>
                <li>Les analyses statistiques et enquêtes qualitatives sont contextualisées aux réalités économiques et sociales du Gabon et de la zone CEMAC.</li>
              </ul>
            </section>

            {/* Engagement 3 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                3. Rigueur Scientifique & Normes APA 7e Édition
              </h2>
              <p>
                La présentation formelle et l'appareil critique obéissent rigoureusement aux conventions académiques internationales adoptées par l'Université Omar Bongo (UOB Libreville), l'INSG et l'USTM :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Norme bibliographique <strong>APA 7e édition</strong> ou <strong>ISO 690</strong> selon la charte typographique de l'établissement.</li>
                <li>Cadrage épistémologique explicite (posture positiviste, interprétativiste ou constructiviste).</li>
                <li>Formulation rigoureuse des hypothèses opérationnelles et discussion critique des résultats.</li>
              </ul>
            </section>

            {/* Engagement 4 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                4. Rôle de l'Étudiant & Préparation à la Soutenance
              </h2>
              <p>
                Notre mission est de fournir un modèle académique de référence de haut niveau méthodologique. L'étudiant s'engage à :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Suivre l'avancement des quatre jalons méthodologiques dans son Espace Client.</li>
                <li>S'approprier les concepts, théories et démonstrations rédigés en vue de son exposé devant le jury de soutenance.</li>
                <li>Transmettre les directives et remarques de son directeur de recherche afin d'effectuer les ajustements nécessaires lors de la période de garantie de 30 jours.</li>
              </ul>
            </section>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © 2026 MémoirePro Gabon · Comité d'Éthique & de Déontologie Académique · Libreville
      </footer>
    </div>
  );
}
