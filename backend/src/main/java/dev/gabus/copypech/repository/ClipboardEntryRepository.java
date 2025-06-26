package dev.gabus.copypech.repository;

import dev.gabus.copypech.entity.ClipboardEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface ClipboardEntryRepository extends JpaRepository<ClipboardEntry, Long> {

    /**
     * Encuentra las últimas 20 entradas del portapapeles, ordenadas por fecha de creación de forma descendente.
     * @return Una lista de las últimas entradas del portapapeles.
     */
    List<ClipboardEntry> findTop20ByOrderByCreatedAtDesc();

    /**
     * Encuentra la última entrada de un tipo de contenido específico.
     * @param contentType El tipo de contenido (por ejemplo, "text/plain").
     * @return La última entrada de ese tipo, o null si no se encuentra.
     */
    ClipboardEntry findFirstByContentTypeOrderByCreatedAtDesc(String contentType);
}
